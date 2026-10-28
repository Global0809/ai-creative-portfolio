import * as THREE from 'three';
import { gsap } from 'gsap';

const clamp = THREE.MathUtils.clamp;
const W = 3.65, H = 4.56, SPACING = 5.35;

/** A single spatial archive: every submitted work occupies a place on the rail. */
export function initScene({ container, items = [], onSelect, onHover, onActive, reducedMotion = false }) {
  if (!container) throw new Error('The spatial archive needs a container.');
  // any-pointer still identifies a touch-capable iPad when a trackpad is primary.
  const touchQuality = window.matchMedia('(any-pointer: coarse)').matches;
  const proceduralScale = touchQuality ? 0.5 : 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.scene = 'living-spatial-archive';
  canvas.dataset.pointerState = 'idle';
  canvas.dataset.activePointer = 'none';
  canvas.dataset.textureScale = String(proceduralScale);
  canvas.dataset.ambientFps = touchQuality ? '30' : '60';
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab;';
  container.appendChild(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c89472');
  scene.fog = new THREE.FogExp2('#c89472', 0.032);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const gallery = new THREE.Group();
  scene.add(gallery);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const aim = new THREE.Vector3();
  const view = { position: 0 };
  const dark = new THREE.Color('#251a15');
  const selectedColor = new THREE.Color('#70301b');
  const hoveredColor = new THREE.Color('#4d2e20');
  scene.add(new THREE.HemisphereLight('#fff0d8', '#70422e', 2.1));
  const key = new THREE.DirectionalLight('#fff0d8', 3.8);
  key.position.set(-8, 12, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -17, right: 17, top: 11, bottom: -13, far: 48 });
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 5;
  key.target.position.set(0, 1, -3);
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#f5c4a2', 1.2);
  fill.position.set(8, 5, -8);
  scene.add(fill);
  const shared = new Set();
  const own = value => { shared.add(value); return value; };
  const plane = own(new THREE.PlaneGeometry(1, 1));
  const bodyGeometry = own(roundedPanel(W, H, 0.13, 0.12));
  const insetGeometry = own(roundedPanel(3.18, 2.66, 0.055, 0.065));
  const floorMaterial = own(new THREE.MeshStandardMaterial({ color: '#b87951', roughness: 0.98, metalness: 0 }));
  const floor = new THREE.Mesh(own(new THREE.PlaneGeometry(180, 180)), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  scene.add(floor);
  const shadowTexture = own(softTexture('shadow'));
  const shadowMaterial = own(new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.48, depthWrite: false }));
  const hazeTexture = own(softTexture('haze'));
  const hazeMaterial = own(new THREE.MeshBasicMaterial({ map: hazeTexture, color: '#ffe9c8', transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false }));
  const lightPool = new THREE.Mesh(plane, hazeMaterial);
  lightPool.rotation.x = -Math.PI / 2;
  lightPool.position.set(5, -0.065, 0);
  lightPool.scale.set(32, 27, 1);
  scene.add(lightPool);
  const backHaze = new THREE.Mesh(plane, hazeMaterial);
  backHaze.position.set(5, 7, -19);
  backHaze.scale.set(47, 24, 1);
  scene.add(backHaze);
  const rail = new THREE.Group();
  scene.add(rail);
  const railMaterial = own(new THREE.LineBasicMaterial({ color: '#6a3a24', transparent: true, opacity: 0.25 }));
  const ticks = [];
  for (let n = -75; n <= 75; n++) {
    const x = n * 0.42;
    const length = n % 5 === 0 ? 0.34 : 0.14;
    ticks.push(new THREE.Vector3(x, -0.075, 3.3), new THREE.Vector3(x, -0.075, 3.3 + length));
  }
  rail.add(new THREE.LineSegments(own(new THREE.BufferGeometry().setFromPoints(ticks)), railMaterial));
  rail.add(new THREE.Line(own(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-40, -0.075, 3.3), new THREE.Vector3(40, -0.075, 3.3)])), railMaterial));
  // The same warm material world continues into a real, depth-tested dust field.
  // Two bounded draws keep the atmospheric volume inexpensive on phones.
  const dustLayers = [makeDustLayer(560, false, own), makeDustLayer(140, true, own)];
  dustLayers.forEach(layer => scene.add(layer.points));
  const fleckGeometry = own(new THREE.BoxGeometry(0.045, 0.115, 0.018));
  const fleckMaterial = own(new THREE.MeshStandardMaterial({ color: '#b28a55', roughness: 0.42, metalness: 0.72 }));
  const flecks = own(new THREE.InstancedMesh(fleckGeometry, fleckMaterial, 10));
  flecks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  flecks.frustumCulled = false;
  const fleckPose = new THREE.Object3D();
  const fleckSeeds = Array.from({ length: 10 }, (_, index) => ({
    x: (index % 2 ? -1 : 1) * (4.4 + (index * 1.37) % 4.1),
    y: 1.3 + (index * 0.71) % 3.3,
    z: 2.2 + (index * 0.93) % 3.8,
    phase: index * 2.17,
  }));
  scene.add(flecks);
  const rippleMaterial = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uAge: { value: 8 }, uColor: { value: new THREE.Color('#edb584') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      varying vec2 vUv; uniform float uAge; uniform vec3 uColor;
      void main(){
        float radius=length(vUv-0.5);
        float ring=exp(-pow((radius-(0.035+uAge*0.19))/0.009,2.0));
        float fade=exp(-uAge*1.2)*(1.0-smoothstep(2.1,2.5,uAge));
        gl_FragColor=vec4(uColor,ring*fade*0.2);
        #include <colorspace_fragment>
      }`,
  }));
  const groundRipple = new THREE.Mesh(plane, rippleMaterial);
  groundRipple.rotation.x = -Math.PI / 2;
  groundRipple.position.set(0, -0.042, 0.2);
  groundRipple.scale.set(18, 18, 1);
  scene.add(groundRipple);
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, mobile = false, destroyed = false, hasContext = true, visible = true;
  let requestedMotion = !reducedMotion, motion = !reducedMotion && !motionPreference.matches, frame = 0, previousTime = 0;
  let lastRenderTime = 0, interactionUntil = 0, activePointerId = null;
  let elapsed = 0, rippleAge = 8, gust = 0, wind = 0, windDirection = 1, cameraLean = 0, priorPosition = 0;
  let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
  let hovered = null, down = null, dragging = false, dragDistance = 0;
  let selectedCategory = 'All', selectedIndex = 0, selectedId = null;
  let wheelAmount = 0, wheelTime = -1000, lastWheelEvent = -1000;
  let records = [], pool = [], hits = [];
  const tweens = new Set();
  function active() { return !destroyed && hasContext && visible && !document.hidden; }
  function requestDraw(interactive = true) {
    if (interactive !== false) interactionUntil = performance.now() + 90;
    if (active() && !frame) frame = requestAnimationFrame(tick);
  }
  function tween(target, values) {
    let animation;
    animation = gsap.to(target, {
      ...values, duration: motion ? (values.duration ?? 0.85) : 0, overwrite: 'auto',
      onUpdate: requestDraw,
      onComplete: () => { tweens.delete(animation); requestDraw(); },
      onInterrupt: () => { tweens.delete(animation); },
    });
    if (animation.duration()) tweens.add(animation);
    if (!active()) animation.pause();
    return animation;
  }
  function syncActivity() {
    for (const animation of tweens) active() ? animation.resume() : animation.pause();
    if (!active()) {
      resetPointer({ snap: true });
      cancelAnimationFrame(frame); frame = 0; previousTime = 0; lastRenderTime = 0;
    }
    else requestDraw();
  }
  function tick(time) {
    frame = 0;
    if (!active()) return;
    const interactive = activePointerId !== null || tweens.size > 0 || time < interactionUntil;
    if (touchQuality && motion && !interactive && lastRenderTime && time - lastRenderTime < 1000 / 30 - 1) {
      requestDraw(false);
      return;
    }
    const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0.016;
    previousTime = time;
    if (motion) {
      elapsed += dt;
      rippleAge += dt;
      gust *= Math.exp(-dt * 1.9);
      wind += gust * windDirection * dt * 1.1;
      const velocity = clamp((view.position - priorPosition) / dt, -5, 5);
      cameraLean += (velocity - cameraLean) * (1 - Math.exp(-dt * 4.5));
    }
    priorPosition = view.position;
    const smoothing = motion ? 1 - Math.exp(-dt * 5.2) : 1;
    currentX += ((motion ? pointerX : 0) - currentX) * smoothing;
    currentY += ((motion ? pointerY : 0) - currentY) * smoothing;
    render(elapsed);
    lastRenderTime = time;
    const unsettled = Math.abs(currentX - pointerX) + Math.abs(currentY - pointerY) > 0.001 && motion;
    if (motion || tweens.size || unsettled) requestDraw(false);
  }
  function render(time = 0) {
    const aspect = width / height;
    const compactTouchLandscape = touchQuality && !mobile && width > height && height < 900;
    const cameraZ = mobile ? Math.max(14.9, 6.3 / aspect) : compactTouchLandscape ? 16 : 14.8;
    const driftX = Math.sin(time * 0.17) * 0.045;
    const driftY = Math.sin(time * 0.23) * 0.025;
    camera.position.set(currentX * 0.32 - 0.35 + driftX, 4.35 + currentY * 0.17 + driftY, cameraZ + Math.sin(time * 0.15) * 0.035);
    aim.set(currentX * 0.1 + driftX * 0.35, 2.55 + currentY * 0.08 + driftY * 0.3, -0.2);
    camera.lookAt(aim);
    camera.rotation.z -= motion ? cameraLean * 0.0025 : 0;
    for (const record of pool) {
      const distance = spatialDistance(record.slot, view.position);
      const abs = Math.abs(distance);
      record.group.visible = abs < 6.5;
      const phase = record.index * 1.71;
      const buoyancy = Math.sin(time * 0.69 + phase) * 0.07;
      record.group.position.set(distance * SPACING, 2.63 + Math.sin(distance * 0.75) * 0.055 + buoyancy + record.reaction.lift, -abs * 1.72);
      record.mount.rotation.set(-0.027 + Math.sin(time * 0.37 + phase) * 0.004, -0.075 - clamp(distance * 0.16, -0.38, 0.38) + Math.sin(time * 0.31 + phase) * 0.008, -0.008 - clamp(distance * 0.006, -0.012, 0.012) + Math.sin(time * 0.48 + phase) * 0.005);
      record.mount.scale.setScalar(1 + 0.045 * Math.max(0, 1 - abs));
      const isSelected = record.item.id === selectedId;
      record.material.color.copy(isSelected ? selectedColor : record === hovered ? hoveredColor : dark);
      record.material.emissive.set(isSelected ? '#160600' : '#000000');
      record.shadow.position.set(distance * SPACING + 0.5, -0.055, -abs * 1.72 + 0.35);
      record.shadow.scale.set(6.6 + buoyancy * 2 + record.reaction.lift, 4.1 + buoyancy, 1);
      record.shadow.visible = abs < 4;
      if (record.vinyl) record.vinyl.rotation.z = -time * 0.07;
    }
    lightPool.position.x = 5 + Math.sin(time * 0.12) * 3.4;
    lightPool.position.z = Math.cos(time * 0.15) * 1.6;
    backHaze.position.x = 5 + Math.sin(time * 0.09) * 2.8;
    hazeMaterial.opacity = 0.39 + Math.sin(time * 0.19) * 0.035;
    fill.intensity = 1.2 + Math.sin(time * 0.24) * 0.08;
    for (const layer of dustLayers) {
      layer.material.uniforms.uTime.value = time;
      layer.material.uniforms.uWind.value = wind;
      layer.material.uniforms.uGust.value = gust;
      layer.material.uniforms.uDirection.value = windDirection;
    }
    for (let index = 0; index < flecks.count; index++) {
      const seed = fleckSeeds[index];
      const side = Math.sign(seed.x);
      const x = mobile ? side * (1.04 + (Math.abs(seed.x) - 4.4) * 0.12) : seed.x;
      fleckPose.position.set(x + Math.sin(time * 0.26 + seed.phase) * (mobile ? 0.07 : 0.24), seed.y + Math.sin(time * 0.43 + seed.phase) * 0.19, seed.z + Math.cos(time * 0.2 + seed.phase) * 0.21);
      fleckPose.rotation.set(time * 0.19 + seed.phase, time * 0.31 + seed.phase * 0.7, Math.sin(time * 0.37 + seed.phase) * 0.7);
      fleckPose.scale.setScalar(0.68 + (index % 4) * 0.15);
      fleckPose.updateMatrix();
      flecks.setMatrixAt(index, fleckPose.matrix);
    }
    flecks.instanceMatrix.needsUpdate = true;
    rippleMaterial.uniforms.uAge.value = rippleAge;
    groundRipple.visible = rippleAge < 2.5;
    rail.position.x = -(view.position * SPACING) % 2.1;
    renderer.render(scene, camera);
  }
  function resize() {
    if (destroyed) return;
    if (activePointerId !== null) resetPointer({ snap: true });
    const rect = container.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height); mobile = width < 650;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : touchQuality ? 1.4 : 1.65));
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.fov = mobile ? 38 : 35;
    camera.updateProjectionMatrix();
    dustLayers.forEach((layer, index) => {
      layer.geometry.setDrawRange(0, mobile ? (index ? 50 : 180) : touchQuality ? (index ? 84 : 336) : layer.count);
      layer.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    });
    flecks.count = mobile ? 6 : touchQuality ? 8 : 10;
    canvas.dataset.quality = mobile ? 'phone' : touchQuality ? 'touch-tablet' : 'desktop';
    canvas.dataset.framing = touchQuality && !mobile && width > height && height < 900 ? 'touch-landscape' : 'standard';
    canvas.dataset.pixelRatio = String(renderer.getPixelRatio());
    canvas.dataset.artMax = String(mobile ? 1024 : touchQuality ? 1200 : 1400);
    canvas.dataset.particles = mobile ? '230' : touchQuality ? '420' : '700';
    canvas.dataset.fragments = String(flecks.count);
    requestDraw();
  }
  function announce() {
    const item = pool[selectedIndex]?.item;
    if (!item || item.id === selectedId) return;
    selectedId = item.id; onActive?.(item, selectedIndex, pool.length);
  }
  function indexInPool(index) {
    return pool.length ? ((index % pool.length) + pool.length) % pool.length : 0;
  }
  function spatialDistance(index, position) {
    if (pool.length <= 1) return 0;
    const half = pool.length / 2;
    return indexInPool(index - position + half) - half;
  }
  function loadNearby() { pool.forEach(record => { if (Math.abs(spatialDistance(record.slot, selectedIndex)) <= 3) record.loadImage(); }); }
  function go(index, immediate = false) {
    if (!pool.length) return;
    const previousId = selectedId;
    selectedIndex = indexInPool(Math.round(index));
    announce(); loadNearby();
    if (motion && !immediate && selectedId !== previousId) {
      windDirection = Math.sign(spatialDistance(selectedIndex, view.position)) || 1;
      gust = Math.min(1.6, gust + 1.05);
      rippleAge = 0;
    }
    if (immediate || !motion) { gsap.killTweensOf(view); view.position = selectedIndex; }
    else {
      // Choose the adjacent occurrence on the continuous circular rail.
      const target = selectedIndex + Math.round((view.position - selectedIndex) / pool.length) * pool.length;
      tween(view, { position: target, duration: 1.1, ease: 'power3.out' });
    }
    requestDraw();
  }
  function setCategory(category = 'All') {
    selectedCategory = category || 'All';
    const previousId = selectedId;
    pool = records.filter(record => selectedCategory === 'All' || record.item.category === selectedCategory);
    records.forEach(record => { record.group.visible = false; record.shadow.visible = false; });
    pool.forEach((record, index) => { record.slot = index; record.group.visible = true; });
    selectedId = null;
    const existing = pool.findIndex(record => record.item.id === previousId);
    go(Math.max(0, existing), true); changeHover(null);
  }
  function makeRecord(item, index) {
    const group = new THREE.Group(), mount = new THREE.Group();
    group.add(mount); gallery.add(group);
    const resources = new Set();
    const local = value => { resources.add(value); return value; };
    const material = local(new THREE.MeshStandardMaterial({ color: dark, roughness: 0.54, metalness: 0.18 }));
    const panel = new THREE.Mesh(bodyGeometry, material);
    panel.castShadow = true; panel.receiveShadow = true; mount.add(panel);
    const sideMaterial = local(new THREE.MeshStandardMaterial({ color: '#b59b7c', roughness: 0.48, metalness: 0.6 }));
    const side = new THREE.Mesh(bodyGeometry, sideMaterial);
    side.position.set(0.035, -0.018, -0.095); mount.add(side);
    const insetMaterial = local(new THREE.MeshStandardMaterial({ color: '#110e0c', roughness: 0.92 }));
    const inset = new THREE.Mesh(insetGeometry, insetMaterial);
    inset.position.set(0, -0.26, 0.15); mount.add(inset);
    const defaultTexture = local(sleeveTexture(item, proceduralScale));
    const imageMaterial = local(new THREE.MeshBasicMaterial({ map: defaultTexture, color: '#ffffff', toneMapped: false }));
    const art = new THREE.Mesh(plane, imageMaterial);
    art.position.set(0, -0.26, 0.217); mount.add(art);
    const textMaterial = local(new THREE.MeshBasicMaterial({ map: local(dossierTexture(item, index, items.length, proceduralScale)), transparent: true, toneMapped: false, depthWrite: false }));
    const text = new THREE.Mesh(plane, textMaterial);
    text.position.z = 0.221; text.scale.set(W, H, 1); mount.add(text);
    const shadow = new THREE.Mesh(plane, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
    const record = { item, index, slot: index, group, mount, material, resources, shadow, targets: [panel, art, inset], image: null, alive: true, loaded: false, vinyl: null, reaction: { lift: 0 } };
    record.targets.forEach(object => { object.userData.record = record; });
    function fit(aspect) {
      const w = Math.min(3.08, 2.54 * aspect);
      art.scale.set(w, w / aspect, 1); requestDraw();
    }
    fit(item.category === 'AI Songs' || item.category === 'Podcasts' ? 1 : item.category === 'Infographics' ? 0.77 : 1.3);
    if (item.category === 'AI Songs' || item.category === 'Podcasts') {
      const vinyl = new THREE.Group();
      const discMaterial = local(new THREE.MeshStandardMaterial({ color: '#121110', roughness: 0.28, metalness: 0.5 }));
      const disc = new THREE.Mesh(local(new THREE.CylinderGeometry(1.33, 1.33, 0.07, 72)), discMaterial);
      disc.rotation.x = Math.PI / 2; disc.castShadow = true; vinyl.add(disc);
      const grooves = local(new THREE.LineBasicMaterial({ color: '#625147', transparent: true, opacity: 0.46 }));
      for (let r = 0.57; r < 1.29; r += 0.075) {
        const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2);
        const ring = new THREE.LineLoop(local(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64))), grooves);
        ring.position.z = 0.04; vinyl.add(ring);
      }
      const label = new THREE.Mesh(local(new THREE.CircleGeometry(0.5, 48)), local(new THREE.MeshStandardMaterial({ map: defaultTexture, roughness: 0.8 })));
      label.position.z = 0.044; vinyl.add(label);
      const spindle = new THREE.Mesh(local(new THREE.CircleGeometry(0.06, 16)), discMaterial);
      spindle.position.z = 0.048; vinyl.add(spindle);
      vinyl.position.set(1.46, -0.28, -0.11); mount.add(vinyl); record.vinyl = vinyl;
      disc.userData.record = record; record.targets.push(disc);
    }
    record.loadImage = () => {
      if (!item.image || record.loaded || !record.alive) return;
      record.loaded = true;
      const image = new Image(); record.image = image;
      image.crossOrigin = 'anonymous'; image.decoding = 'async';
      image.onload = () => {
        if (!record.alive || destroyed) return;
        try {
          const ratio = Math.min(1, (mobile ? 1024 : touchQuality ? 1200 : 1400) / Math.max(image.naturalWidth, image.naturalHeight));
          const surface = document.createElement('canvas');
          surface.width = Math.max(1, Math.round(image.naturalWidth * ratio)); surface.height = Math.max(1, Math.round(image.naturalHeight * ratio));
          surface.getContext('2d').drawImage(image, 0, 0, surface.width, surface.height);
          const texture = local(new THREE.CanvasTexture(surface)); texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          imageMaterial.map = texture; imageMaterial.needsUpdate = true; fit(image.naturalWidth / image.naturalHeight);
        } catch { requestDraw(); }
      };
      image.onerror = requestDraw; image.src = item.image;
    };
    return record;
  }
  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    camera.updateMatrixWorld(); gallery.updateMatrixWorld(true); raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(hits, false).find(hit => hit.object.userData.record.group.visible)?.object.userData.record || null;
  }
  function changeHover(record) {
    if (hovered === record) return;
    if (hovered) tween(hovered.reaction, { lift: 0, duration: 0.38, ease: 'power2.out' });
    hovered = record; canvas.style.cursor = dragging ? 'grabbing' : hovered ? 'pointer' : 'grab';
    if (hovered && motion) tween(hovered.reaction, { lift: hovered.item.id === selectedId ? 0.14 : 0.08, duration: 0.42, ease: 'power3.out' });
    onHover?.(hovered?.item || null); requestDraw();
  }
  function pointerMove(event) {
    if (event.isPrimary === false || (activePointerId !== null && event.pointerId !== activePointerId)) return;
    const touch = event.pointerType === 'touch' || event.pointerType === 'pen';
    const rect = canvas.getBoundingClientRect();
    pointerX = touch ? 0 : clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
    pointerY = touch ? 0 : clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
    if (down) {
      const dx = event.clientX - down.x, dy = event.clientY - down.y;
      dragDistance = Math.hypot(dx, dy);
      if (dragDistance > down.threshold) {
        dragging = true;
        canvas.dataset.pointerState = 'dragging';
        const movement = Math.abs(dx) > Math.abs(dy) * 0.8 ? -dx : -dy;
        const divisor = down.touch ? clamp(Math.min(width, height) * 0.6, 190, 360) : width * 0.3;
        const next = down.position + movement / divisor;
        gsap.killTweensOf(view); view.position = next;
        selectedIndex = indexInPool(Math.round(next)); announce(); loadNearby(); changeHover(null); canvas.style.cursor = 'grabbing';
      }
    } else changeHover(touch ? null : pick(event));
    requestDraw();
  }
  function pointerDown(event) {
    if (event.button !== 0 || event.isPrimary === false || activePointerId !== null) return;
    const touch = event.pointerType === 'touch' || event.pointerType === 'pen';
    activePointerId = event.pointerId;
    down = { x: event.clientX, y: event.clientY, position: view.position, touch, threshold: touch ? 10 : 7 };
    dragDistance = 0;
    canvas.dataset.pointerState = 'pressed'; canvas.dataset.activePointer = String(activePointerId);
    if (touch) { pointerX = pointerY = 0; changeHover(null); }
    try { canvas.setPointerCapture?.(event.pointerId); } catch { /* A detached pointer cannot be captured. */ }
    requestDraw();
  }
  function pointerUp(event) {
    if (!down || event.pointerId !== activePointerId) return;
    const click = dragDistance < down.threshold;
    const record = click ? pick(event) : null;
    resetPointer({ snap: false });
    if (click && record) { if (record.item.id === selectedId) onSelect?.(record.item); else go(record.slot); }
    else if (!click) go(Math.round(view.position));
    requestDraw();
  }
  function resetPointer({ snap = true, release = true } = {}) {
    const id = activePointerId, hadPointer = down !== null;
    activePointerId = null; down = null; dragging = false; dragDistance = 0;
    canvas.dataset.pointerState = 'idle'; canvas.dataset.activePointer = 'none';
    pointerX = pointerY = 0;
    if (release && id !== null) {
      try { if (canvas.hasPointerCapture?.(id)) canvas.releasePointerCapture(id); } catch { /* Capture may already be lost. */ }
    }
    changeHover(null);
    canvas.style.cursor = 'grab';
    if (hadPointer && snap && !destroyed) go(Math.round(view.position));
  }
  function pointerLeave(event) {
    if (activePointerId !== null && event.pointerId !== activePointerId) return;
    pointerX = pointerY = 0; if (!down) changeHover(null); requestDraw();
  }
  function pointerCancel(event) {
    if (event.pointerId !== activePointerId) return;
    resetPointer({ snap: true }); requestDraw();
  }
  function pointerCaptureLost(event) {
    if (event.pointerId !== activePointerId) return;
    resetPointer({ snap: true, release: false }); requestDraw();
  }
  function wheel(event) {
    if (!pool.length) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheelEvent > 180) wheelAmount = 0;
    lastWheelEvent = now;
    const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelAmount += raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
    if (Math.abs(wheelAmount) > 36 && now - wheelTime > 330) {
      go(selectedIndex + Math.sign(wheelAmount)); wheelAmount = 0; wheelTime = now;
    }
  }
  function contextLost(event) { event.preventDefault(); hasContext = false; syncActivity(); container.dispatchEvent(new CustomEvent('sceneunavailable')); }
  function contextRestored() { hasContext = true; syncActivity(); }
  function applyMotion() {
    motion = requestedMotion && !motionPreference.matches;
    canvas.dataset.motion = motion ? 'active' : 'paused';
    previousTime = 0;
    lastRenderTime = 0;
    if (!motion) {
      for (const animation of tweens) animation.kill();
      tweens.clear(); view.position = selectedIndex; priorPosition = view.position;
      currentX = currentY = pointerX = pointerY = cameraLean = 0;
      records.forEach(record => { record.reaction.lift = 0; });
    }
    requestDraw();
  }
  const listeners = { pointermove: pointerMove, pointerdown: pointerDown, pointerup: pointerUp, pointerleave: pointerLeave, pointercancel: pointerCancel, lostpointercapture: pointerCaptureLost, webglcontextlost: contextLost, webglcontextrestored: contextRestored };
  Object.entries(listeners).forEach(([name, handler]) => canvas.addEventListener(name, handler));
  canvas.addEventListener('wheel', wheel, { passive: false });
  document.addEventListener('visibilitychange', syncActivity);
  motionPreference.addEventListener('change', applyMotion);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; syncActivity(); }, { threshold: 0.01 });
  intersectionObserver.observe(container);
  // The caller owns the exhibition sequence, including its mixed-format cadence.
  records = items.map(makeRecord); hits = records.flatMap(record => record.targets);
  resize(); setCategory('All'); applyMotion(); render(elapsed); requestDraw();
  return {
    setCategory,
    focus(id) {
      if (id == null) { go(0); return; }
      let index = pool.findIndex(record => record.item.id === id);
      if (index < 0) { setCategory('All'); index = pool.findIndex(record => record.item.id === id); }
      if (index >= 0) go(index);
    },
    travel(delta = 1) { go(selectedIndex + Number(delta || 0)); },
    setMotion(enabled) {
      requestedMotion = Boolean(enabled);
      applyMotion();
    },
    setImmersive() { requestDraw(); },
    destroy() {
      if (destroyed) return;
      destroyed = true; cancelAnimationFrame(frame);
      resetPointer({ snap: false });
      for (const animation of tweens) animation.kill(); tweens.clear();
      records.forEach(record => {
        record.alive = false;
        if (record.image) { record.image.onload = record.image.onerror = null; record.image.src = ''; }
        record.resources.forEach(resource => resource.dispose?.());
      });
      shared.forEach(resource => resource.dispose?.());
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      Object.entries(listeners).forEach(([name, handler]) => canvas.removeEventListener(name, handler));
      canvas.removeEventListener('wheel', wheel); document.removeEventListener('visibilitychange', syncActivity);
      motionPreference.removeEventListener('change', applyMotion);
      renderer.dispose(); canvas.remove();
    },
  };
}

function makeDustLayer(count, foreground, own) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count * 4);
  let seed = foreground ? 419 : 827;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let index = 0; index < count; index++) {
    positions[index * 3] = (random() - 0.5) * 36;
    positions[index * 3 + 1] = 0.2 + random() * 7.5;
    positions[index * 3 + 2] = foreground ? 3 + random() * 6.5 : -27 + random() * 28;
    phases[index * 4] = random() * Math.PI * 2;
    phases[index * 4 + 1] = random();
    phases[index * 4 + 2] = foreground ? 0.34 + random() * 0.71 : 0.22 + random() * 0.4;
    phases[index * 4 + 3] = foreground ? 0.26 + random() * 0.18 : 0.34 + random() * 0.36;
  }
  const geometry = own(new THREE.BufferGeometry());
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 4));
  const material = own(new THREE.ShaderMaterial({
    transparent: true, depthTest: true, depthWrite: false, toneMapped: false,
    uniforms: {
      uTime: { value: 0 }, uWind: { value: 0 }, uGust: { value: 0 }, uDirection: { value: 1 },
      uPixelRatio: { value: 1 }, uColor: { value: new THREE.Color(foreground ? '#ffe4b2' : '#fff1d3') },
      uBronze: { value: new THREE.Color('#603820') },
    },
    vertexShader: `
      attribute vec4 aPhase;
      uniform float uTime, uWind, uGust, uDirection, uPixelRatio;
      varying float vAlpha, vDepth, vTone; varying vec2 vScreen;
      void main(){
        vec3 p=position;
        p.x=mod(p.x+uTime*(0.08+aPhase.y*0.12)+uWind*(0.5+aPhase.y*0.6)+18.0,36.0)-18.0;
        p.x+=sin(uTime*0.26+aPhase.x)*0.3+uGust*uDirection*sin(aPhase.x)*0.16;
        p.y+=sin(uTime*(0.23+aPhase.y*0.12)+aPhase.x)*0.24;
        p.z+=cos(uTime*0.18+aPhase.x)*0.28;
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*mv;
        vScreen=gl_Position.xy/gl_Position.w;
        gl_PointSize=clamp(aPhase.z*uPixelRatio*160.0/max(1.0,-mv.z),1.8,26.0);
        vAlpha=aPhase.w*(0.78+sin(uTime*0.45+aPhase.x)*0.18+uGust*0.2);
        vDepth=-mv.z;
        vTone=step(0.51,aPhase.y);
      }`,
    fragmentShader: `
      uniform vec3 uColor, uBronze; varying float vAlpha, vDepth, vTone; varying vec2 vScreen;
      void main(){
        vec2 p=gl_PointCoord-0.5;
        float r=length(p)*2.0;
        if(r>1.0)discard;
        float soft=exp(-r*r*6.5)*(1.0-smoothstep(0.65,1.0,r));
        float centerProtection=mix(0.22,1.0,smoothstep(0.2,0.48,abs(vScreen.x)));
        float hudProtection=1.0-smoothstep(0.58,0.87,abs(vScreen.y));
        float depthFade=exp(-vDepth*0.018);
        gl_FragColor=vec4(mix(uBronze,uColor,vTone),soft*vAlpha*centerProtection*hudProtection*depthFade);
        #include <colorspace_fragment>
      }`,
  }));
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, geometry, material, count };
}

function roundedPanel(width, height, depth, radius) {
  const x = -width / 2, y = -height / 2, r = radius;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y); shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r); shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.023, bevelThickness: 0.025, curveSegments: 6 });
  geometry.translate(0, 0, -depth / 2); return geometry;
}
function textureFrom(canvas) { const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture; }
function dossierTexture(item, index, total, scale = 1) {
  const canvas = document.createElement('canvas'); canvas.width = 1024 * scale; canvas.height = 1280 * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = '#cbb69f'; ctx.font = '500 22px "Geist Mono", monospace';
  ctx.fillText(`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}   ${item.category.toUpperCase()}`, 66, 94);
  ctx.fillStyle = '#fff1dd'; ctx.font = '500 46px "Geist", Arial, sans-serif';
  wrapText(ctx, item.title, 62, 176, 895, 55, 2);
  ctx.fillStyle = '#9d775d'; ctx.fillRect(67, 1122, 890, 1);
  ctx.fillStyle = '#dbb799'; ctx.font = '400 20px "Geist Mono", monospace';
  const type = item.kind === 'video' ? 'MOTION / AI' : item.kind === 'audio' || item.category === 'AI Songs' || item.category === 'Podcasts' ? 'AUDIO / AI' : item.category === 'Articles' ? 'EDITORIAL / AI' : 'VISUAL / AI';
  ctx.fillText(type, 68, 1174);
  ctx.textAlign = 'right'; ctx.fillText(item.durationLabel || 'VIEW PROCESS ↗', 953, 1174);
  ctx.fillStyle = '#92735e'; ctx.textAlign = 'left'; ctx.font = '400 16px "Geist Mono", monospace';
  ctx.fillText('ARTIFACT  →  PROMPT  →  REFLECTION', 68, 1225);
  return textureFrom(canvas);
}
function sleeveTexture(item, scale = 1) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024 * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = item.color || '#d7c4a6'; ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = '#eee0c8'; ctx.fillRect(42, 42, 940, 940);
  ctx.fillStyle = '#30251d'; ctx.font = '500 24px "Geist Mono", monospace'; ctx.fillText(item.category.toUpperCase(), 88, 110);
  ctx.fillRect(88, 150, 848, 2); ctx.font = '500 92px "Geist", Arial, sans-serif';
  wrapText(ctx, item.title, 80, 280, 842, 104, 4);
  if (item.category === 'AI Songs' || item.category === 'Podcasts') {
    ctx.strokeStyle = '#927b61'; ctx.lineWidth = 2;
    for (let r = 90; r <= 210; r += 14) { ctx.beginPath(); ctx.arc(780, 823, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = '#a14e2e'; ctx.beginPath(); ctx.arc(780, 823, 65, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#8f7f69'; for (let n = 0; n < 8; n++) ctx.fillRect(88, 730 + n * 22, n % 3 === 0 ? 520 : 840, 3);
  }
  return textureFrom(canvas);
}
function softTexture(kind) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d'); const gradient = ctx.createRadialGradient(128, 128, 4, 128, 128, 126);
  if (kind === 'shadow') { gradient.addColorStop(0, 'rgba(34,15,7,0.85)'); gradient.addColorStop(0.33, 'rgba(34,15,7,0.42)'); gradient.addColorStop(1, 'rgba(34,15,7,0)'); }
  else { gradient.addColorStop(0, 'rgba(255,248,221,0.95)'); gradient.addColorStop(0.35, 'rgba(255,248,221,0.55)'); gradient.addColorStop(1, 'rgba(255,248,221,0)'); }
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256); return textureFrom(canvas);
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || '').split(/\s+/); let line = '', row = 0;
  for (let n = 0; n < words.length; n++) {
    const test = line ? `${line} ${words[n]}` : words[n];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + row * lineHeight); row++; line = words[n];
      if (row >= maxLines - 1) {
        let rest = [line, ...words.slice(n + 1)].join(' ');
        while (ctx.measureText(rest).width > maxWidth && rest.length > 2) rest = rest.slice(0, -2);
        ctx.fillText(rest, x, y + row * lineHeight); return;
      }
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y + row * lineHeight);
}
