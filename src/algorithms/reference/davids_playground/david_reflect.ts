import { fColorPoint } from "../../../constants";
import { AlgorithmBuilder } from "../../../schema/builder";

export default new AlgorithmBuilder({
    title: "david reflect"
}).addComputeNode({
    type: "time",
    id: "time",
    params: {}
})
    .addModuleNode({
        "type": "wave-module",
        "id": "w0",
        "params": {
            frequency: {
                v: 0.01
            }
        }
    }).addModuleNode({
        type: "orbit-module",
        id: "o1",
        params: {
            time: {
                ref: "time.time"
            },
            "radius": {
                "ref": "w0.value"
            },

            speed: {
                v: 0.5
            },

            numPoints: {
                v: 20,
            },
            centerPoints: {
                v: [
                    {
                        v: fColorPoint()
                    }
                ]
            }
        }
    }).addModuleNode({
        "type": "wave-module",
        "id": "w1",
        "params": {
            frequency: {
                v: 0.01
            }
        }
    }).addModuleNode({
        type: "orbit-module",
        id: "r1",
        params: {
            time: {
                ref: "time.time"
            },
            "radius": {
                ref: "w1.value"
            },
            numPoints: {
                v: 20,
            },
            speed: {
                v: 1
            },
            centerPoints: {
                v: [
                    {
                        v: fColorPoint()
                    }
                ]
            }
        }
    }).addModuleNode({
        type: "reflect-module",
        id: "reflect",
        params: {

            "inputPoints": {
                ref: "o1.points"
            },
            "reflectionPoints": {
                ref: "r1.points"
            }
        }
    }).addModuleNode({
        "type": "point-render-module",
        "id": "point-render",
        params: {
            "points": {
                ref: "reflect.points"
            }
        }
    })
    .construct();