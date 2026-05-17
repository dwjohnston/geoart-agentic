import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Mona Lisa — an orbital approximation.
//
// A face-shaped elliptical orbit forms the silhouette.
// Two eye-clusters use orbits centered on offset points derived
// from the face orbit's phase-shifted children.
// A smile is drawn as a slow dense spirograph between two
// mouth-corner orbits, using an irrational speed ratio.
// Warm sfumato palette: burnt sienna, raw umber, ivory.

const graph: GeoArtGraph = {
    version: '2.0',
    title: 'Mona Lisa',
    control: {
        nodes: [
            {
                id: 'speedSlider',
                type: 'slider',
                params: {
                    label: { v: 'Drawing Speed' },
                    min: { v: -5 },
                    max: { v: 5 },
                    value: { v: 0.6 },
                    step: { v: 0.01 },
                },
            },
            {
                id: 'skinColor',
                type: 'colorPicker',
                params: {
                    label: { v: 'Skin Tone' },
                    value: { v: { r: 0.91, g: 0.76, b: 0.53, a: 0.18 } },
                },
            },
            {
                id: 'shadowColor',
                type: 'colorPicker',
                params: {
                    label: { v: 'Shadow (sfumato)' },
                    value: { v: { r: 0.35, g: 0.22, b: 0.13, a: 0.22 } },
                },
            },
            {
                id: 'eyeColor',
                type: 'colorPicker',
                params: {
                    label: { v: 'Eye Color' },
                    value: { v: { r: 0.18, g: 0.14, b: 0.10, a: 0.85 } },
                },
            },
            {
                id: 'smileColor',
                type: 'colorPicker',
                params: {
                    label: { v: 'Smile Color' },
                    value: { v: { r: 0.55, g: 0.28, b: 0.20, a: 0.55 } },
                },
            },
            {
                id: 'linkRate',
                type: 'slider',
                params: {
                    label: { v: 'Link Rate' },
                    min: { v: 1 },
                    max: { v: 30 },
                    step: { v: 1 },
                    value: { v: 1 },
                },
            },
        ],
    },
    compute: {
        nodes: [
            { id: 'time', type: 'time', params: {} },

            // ── Face silhouette ──────────────────────────────────────────
            // A slow wide ellipse tracing the head outline, shifted up slightly
            {
                id: 'faceOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.38 },
                    speed: { ref: 'speedSlider.value' },
                },
            },

            // Secondary face-shaping orbit (tighter, faster) for sfumato fill
            {
                id: 'faceFillOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.28 },
                    speed: { v: 1.618 },         // golden ratio — never repeats cleanly
                    center: { v: { x: 0, y: 0.05 } },
                },
            },

            // Innermost face fill — very tight, fast, dense coverage
            {
                id: 'faceInnerOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.18 },
                    speed: { v: 2.718 },         // e — irrational, fine grain fill
                    center: { v: { x: 0, y: 0.05 } },
                },
            },

            // ── Left eye cluster ─────────────────────────────────────────
            // Orbits centered on a fixed offset (left eye socket position)
            {
                id: 'leftEyeOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.055 },
                    speed: { v: 7.389 },         // e² — very fast, tight pupil spiral
                    center: { v: { x: -0.13, y: 0.12 } },
                },
            },
            {
                id: 'leftEyeBrowOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.065 },
                    speed: { v: 5.1 },
                    center: { v: { x: -0.13, y: 0.20 } },
                },
            },

            // ── Right eye cluster ────────────────────────────────────────
            {
                id: 'rightEyeOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.055 },
                    speed: { v: 7.389 },
                    center: { v: { x: 0.13, y: 0.12 } },
                },
            },
            {
                id: 'rightEyeBrowOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.065 },
                    speed: { v: 5.1 },
                    center: { v: { x: 0.13, y: 0.20 } },
                },
            },

            // ── Smile ────────────────────────────────────────────────────
            // Two mouth-corner orbits; a timedLine between them traces the smile.
            // The irrational speed ratio (√5 ≈ 2.236 vs √2 ≈ 1.414) means the
            // crossing pattern never exactly repeats — just like the real thing.
            {
                id: 'mouthLeftOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.042 },
                    speed: { v: 2.236 },
                    center: { v: { x: -0.09, y: -0.10 } },
                },
            },
            {
                id: 'mouthRightOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.042 },
                    speed: { v: 1.414 },
                    center: { v: { x: 0.09, y: -0.10 } },
                },
            },

            // ── Nose bridge ─────────────────────────────────────────────
            {
                id: 'noseOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.048 },
                    speed: { v: 3.301 },         // ln(e³) — arbitrary irrational
                    center: { v: { x: 0, y: 0.0 } },
                },
            },

            // ── Hair / veil mass ─────────────────────────────────────────
            {
                id: 'hairOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.46 },
                    speed: { v: 0.382 },        // 1 - golden ratio ≈ subtle slow drift
                    center: { v: { x: 0, y: 0.08 } },
                },
            },
            {
                id: 'hairFillOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.40 },
                    speed: { v: 0.577 },        // 1/√3
                    center: { v: { x: 0, y: 0.08 } },
                },
            },

            // ── Shoulders / décolletage ──────────────────────────────────
            {
                id: 'shoulderOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.52 },
                    speed: { v: 0.236 },
                    center: { v: { x: 0, y: -0.35 } },
                },
            },

            // ── ColorPoint packing ───────────────────────────────────────
            {
                id: 'cpFace',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'faceOrbit.point' },
                    color: { ref: 'skinColor.value' },
                },
            },
            {
                id: 'cpFaceFill',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'faceFillOrbit.point' },
                    color: { ref: 'skinColor.value' },
                },
            },
            {
                id: 'cpFaceInner',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'faceInnerOrbit.point' },
                    color: { ref: 'shadowColor.value' },
                },
            },
            {
                id: 'cpLeftEye',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'leftEyeOrbit.point' },
                    color: { ref: 'eyeColor.value' },
                },
            },
            {
                id: 'cpLeftBrow',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'leftEyeBrowOrbit.point' },
                    color: { ref: 'shadowColor.value' },
                },
            },
            {
                id: 'cpRightEye',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'rightEyeOrbit.point' },
                    color: { ref: 'eyeColor.value' },
                },
            },
            {
                id: 'cpRightBrow',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'rightEyeBrowOrbit.point' },
                    color: { ref: 'shadowColor.value' },
                },
            },
            {
                id: 'cpMouthLeft',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'mouthLeftOrbit.point' },
                    color: { ref: 'smileColor.value' },
                },
            },
            {
                id: 'cpMouthRight',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'mouthRightOrbit.point' },
                    color: { ref: 'smileColor.value' },
                },
            },
            {
                id: 'cpNose',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'noseOrbit.point' },
                    color: { ref: 'shadowColor.value' },
                },
            },
            {
                id: 'cpHair',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'hairOrbit.point' },
                    color: { ref: 'shadowColor.value' },
                },
            },
            {
                id: 'cpHairFill',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'hairFillOrbit.point' },
                    color: { ref: 'shadowColor.value' },
                },
            },
            {
                id: 'cpShoulder',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'shoulderOrbit.point' },
                    color: { ref: 'skinColor.value' },
                },
            },
        ],
    },
    render: {
        nodes: [
            // ── Hair mass (drawn first — behind face) ────────────────────
            {
                id: 'hairLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpHair.colorPoint' },
                    colorPointB: { ref: 'cpHairFill.colorPoint' },
                },
            },

            // ── Face silhouette fill ─────────────────────────────────────
            {
                id: 'faceOuterLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpFace.colorPoint' },
                    colorPointB: { ref: 'cpFaceFill.colorPoint' },
                },
            },
            {
                id: 'faceFillLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpFaceFill.colorPoint' },
                    colorPointB: { ref: 'cpFaceInner.colorPoint' },
                },
            },

            // ── Shoulders ────────────────────────────────────────────────
            {
                id: 'shoulderLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpShoulder.colorPoint' },
                    colorPointB: { ref: 'cpFace.colorPoint' },
                },
            },

            // ── Nose bridge ──────────────────────────────────────────────
            {
                id: 'noseLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpNose.colorPoint' },
                    colorPointB: { ref: 'cpFaceInner.colorPoint' },
                },
            },

            // ── Eyes ─────────────────────────────────────────────────────
            {
                id: 'leftEyeLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpLeftEye.colorPoint' },
                    colorPointB: { ref: 'cpLeftBrow.colorPoint' },
                },
            },
            {
                id: 'rightEyeLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpRightEye.colorPoint' },
                    colorPointB: { ref: 'cpRightBrow.colorPoint' },
                },
            },

            // ── The Smile — the enigmatic one ────────────────────────────
            // √5 vs √2 speed ratio: the crossing locus traces a gentle curve
            // concentrated in the centre, falling off at the corners.
            {
                id: 'smileLine',
                type: 'timedLine',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { ref: 'linkRate.value' },
                    colorPointA: { ref: 'cpMouthLeft.colorPoint' },
                    colorPointB: { ref: 'cpMouthRight.colorPoint' },
                },
            },

            // ── Live position dots ───────────────────────────────────────
            {
                id: 'dotFace',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'faceOrbit.point' },
                    radius: { v: 0.012 },
                    color: { v: { r: 0.91, g: 0.76, b: 0.53, a: 0.6 } },
                },
            },
            {
                id: 'dotLeftEye',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'leftEyeOrbit.point' },
                    radius: { v: 0.009 },
                    color: { v: { r: 0.18, g: 0.14, b: 0.10, a: 1.0 } },
                },
            },
            {
                id: 'dotRightEye',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'rightEyeOrbit.point' },
                    radius: { v: 0.009 },
                    color: { v: { r: 0.18, g: 0.14, b: 0.10, a: 1.0 } },
                },
            },
            {
                id: 'dotSmileLeft',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'mouthLeftOrbit.point' },
                    radius: { v: 0.007 },
                    color: { v: { r: 0.55, g: 0.28, b: 0.20, a: 1.0 } },
                },
            },
            {
                id: 'dotSmileRight',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'mouthRightOrbit.point' },
                    radius: { v: 0.007 },
                    color: { v: { r: 0.55, g: 0.28, b: 0.20, a: 1.0 } },
                },
            },
        ],
    },
};

export default graph;
