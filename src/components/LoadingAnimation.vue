<template>
  <div class="loading-screen" :class="{ 'is-hidden': isComplete }">
    <div class="rose-wrapper">
      <svg viewBox="0 0 100 100" fill="none">
        <defs>
          <filter id="roseGlow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FFD100" />
            <stop offset="100%" stop-color="#00935F" />
          </linearGradient>
        </defs>
        <g id="roseGroup" filter="url(#roseGlow)">
          <path id="rosePath" stroke-linecap="round" stroke-linejoin="round" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const SVG_NS = 'http://www.w3.org/2000/svg'
const isComplete = ref(false)

const config = {
  name: 'Rose Orbit',
  tag: 'r = cos(kθ)',
  rotate: true,
  particleCount: 72,
  trailSpan: 0.42,
  durationMs: 5200,
  rotationDurationMs: 28000,
  pulseDurationMs: 4600,
  strokeWidth: 5.2,
  orbitRadius: 7,
  detailAmplitude: 2.7,
  petalCount: 7,
  curveScale: 3.9,
  point(progress, detailScale, cfg) {
    const t = progress * Math.PI * 2
    const k = Math.round(cfg.petalCount)
    const r = cfg.orbitRadius - cfg.detailAmplitude * detailScale * Math.cos(k * t)
    return {
      x: 50 + Math.cos(t) * r * cfg.curveScale,
      y: 50 + Math.sin(t) * r * cfg.curveScale,
    }
  },
}

let rafId = null

onMounted(() => {
  const path = document.querySelector('#rosePath')
  const group = document.querySelector('#roseGroup')
  if (!path || !group) return

  path.setAttribute('stroke-width', String(config.strokeWidth))

  // Create particles
  const particles = Array.from({ length: config.particleCount }, () => {
    const circle = document.createElementNS(SVG_NS, 'circle')
    circle.setAttribute('fill', 'currentColor')
    group.appendChild(circle)
    return circle
  })

  function normalizeProgress(progress) {
    return ((progress % 1) + 1) % 1
  }

  function getDetailScale(time) {
    const pulseProgress = (time % config.pulseDurationMs) / config.pulseDurationMs
    const pulseAngle = pulseProgress * Math.PI * 2
    return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48
  }

  function getRotation(time) {
    if (!config.rotate) return 0
    return -((time % config.rotationDurationMs) / config.rotationDurationMs) * 360
  }

  function buildPath(detailScale, steps = 480) {
    return Array.from({ length: steps + 1 }, (_, index) => {
      const pt = config.point(index / steps, detailScale, config)
      return `${index === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`
    }).join(' ')
  }

  function getParticle(index, progress, detailScale) {
    const tailOffset = index / (config.particleCount - 1)
    const pt = config.point(
      normalizeProgress(progress - tailOffset * config.trailSpan),
      detailScale,
      config
    )
    const fade = Math.pow(1 - tailOffset, 0.56)
    return {
      x: pt.x,
      y: pt.y,
      radius: 0.9 + fade * 2.7,
      opacity: 0.04 + fade * 0.96,
    }
  }

  const startedAt = performance.now()

  function render(now) {
    const time = now - startedAt
    const progress = (time % config.durationMs) / config.durationMs
    const detailScale = getDetailScale(time)

    group.setAttribute('transform', `rotate(${getRotation(time)} 50 50)`)
    path.setAttribute('d', buildPath(detailScale))

    particles.forEach((node, index) => {
      const p = getParticle(index, progress, detailScale)
      node.setAttribute('cx', p.x.toFixed(2))
      node.setAttribute('cy', p.y.toFixed(2))
      node.setAttribute('r', p.radius.toFixed(2))
      node.setAttribute('opacity', p.opacity.toFixed(3))
    })

    rafId = requestAnimationFrame(render)
  }

  rafId = requestAnimationFrame(render)

  // Auto-hide after 3.5s
  setTimeout(() => {
    isComplete.value = true
  }, 3500)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--nyc-white);
  color: #000000;
  transition: opacity 0.8s ease, visibility 0.8s ease;
  font-family: 'Inter', '思源黑体', sans-serif;
}

.loading-screen.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.rose-wrapper {
  width: min(52vmin, 320px);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
}

.rose-wrapper svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  color: #FFD100;
}

#rosePath {
  stroke: url(#pathGrad);
  opacity: 0.7;
}

/* Particles inherit currentColor (yellow) */
.rose-wrapper svg circle {
  color: #FFD100;
}

/* Tail particles interpolate toward green */
.rose-wrapper svg circle:nth-child(n+36) {
  color: #00935F;
}

</style>