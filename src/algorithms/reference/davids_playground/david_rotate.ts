import { fColorPoint } from "../../../constants";
import { AlgorithmBuilder } from "../../../schema/builder";

export default new AlgorithmBuilder({
    title: "Davids rotate"
})
    .addComputeNode({
        type: "time",
        id: "time",
        params: {}
    })
    .addModuleNode({
        type: "orbit-module",
        id: "o1",
        params: {
            time: {
                ref: "time.time"
            },
            numPoints: {
                v: 20
            },
            "radius": {
                v: 0.3
            },
            centerPoints: {
                v: [{
                    v: fColorPoint()
                }]
            }
        }
    }).addModuleNode({
        type: "orbit-module",
        id: "o2",
        params: {
            time: {
                ref: "time.time"
            },
            numPoints: {
                v: 10
            },
            "radius": {
                v: 0.25
            },
            centerPoints: {
                v: [{
                    v: fColorPoint()
                }]
            }
        }
    }).addModuleNode({
        type: "wave-module",
        id: "wave",
        params: {

        }
    })
    .addModuleNode({
        type: "rotate-module",
        id: "rotate",
        params: {
            inputPoints: {
                ref: 'o1.points',

            },
            rotationCenters: {
                ref: "o2.points"
            },
            rotationAmount: {
                ref: "wave.value"
            }
        }
    }).addModuleNode({
        type: "point-render-module",
        id: "render-point",
        params: {
            "points": {
                ref: "rotate.points"
            }
        }
    }).construct()