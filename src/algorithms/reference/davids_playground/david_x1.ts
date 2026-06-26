import { fColorPoint } from "../../../constants";
import { AlgorithmBuilder } from "../../../schema/builder";

export default new AlgorithmBuilder({
    title: "DAVID X1",
    "author": "david"
}).addComputeNode({
    type: "time",
    id: "time",
    params: {}
})
    .addModuleNode({


        type: "orbit-module", 'id': 'reflections', params: {

            centerPoints: {
                v: [
                    {
                        v: fColorPoint()
                    }
                ]
            },
            numPoints: {
                v: 4
            },
            radius: {
                v: 0
            },
            speed: {
                v: 0
            }
        }
    })
    .addModuleNode({
        type: "wave-module",
        id: "wave-a",
        params: {

        }
    })
    .addModuleNode({
        type: "wave-module",
        id: "wave-b",
        params: {

        }
    })
    .addModuleNode({
        type: "orbit-module",
        "id": "base-orbit",
        params: {

            centerPoints: {
                v: [
                    {
                        v: fColorPoint()
                    }
                ]
            },
            time: {
                ref: "time.time"
            },
            "radius": {
                ref: "wave-a.value"
            },
            speed: {
                ref: "wave-b.value"
            }
        }

    })
    .addModuleNode({
        type: "orbit-module",
        "id": "base-points",
        "params": {
            time: {
                ref: "time.time"
            },
            centerPoints: {
                ref: "base-orbit.points"
            }

        }
    })
    .addModuleNode({
        type: "reflect-module",
        id: "base-reflect",
        params: {
            reflectionPoints: {
                ref: "reflections.points"
            },
            inputPoints: {
                ref: "base-points.points"
            }
        }
    }).addModuleNode({
        "id": "draw",
        type: "point-render-module",
        "params": {
            "points": {
                ref: "base-reflect.points"
            }
        }
    }).construct()