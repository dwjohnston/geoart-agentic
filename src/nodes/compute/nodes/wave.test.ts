import { describe, expect, it, test } from 'bun:test';
import waveNodeImplementation from './wave';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';

const base = { time: 0, waveType: 'sine' as const, frequency: 1, amplitude: 1, phase: 0, samplerTemporalImpact: 0, frequencyModulator: null, amplitudeModulator: null } satisfies NodeInputsResolved<"wave">;

describe('waveNodeImplementation', () => {
  describe('sine', () => {
    test('zero at t=0', () => {
      expect(waveNodeImplementation.evaluate(base).value).toBeCloseTo(0);
    });
    test('peaks at +1 at t=15 (quarter cycle)', () => {
      expect(waveNodeImplementation.evaluate({ ...base, time: 15 }).value).toBeCloseTo(1);
    });
    test('zero at t=30 (half cycle)', () => {
      expect(waveNodeImplementation.evaluate({ ...base, time: 30 }).value).toBeCloseTo(0);
    });
    test('troughs at -1 at t=45 (three-quarter cycle)', () => {
      expect(waveNodeImplementation.evaluate({ ...base, time: 45 }).value).toBeCloseTo(-1);
    });
    test('amplitude scales output', () => {
      expect(waveNodeImplementation.evaluate({ ...base, amplitude: 0.5, time: 15 }).value).toBeCloseTo(0.5);
    });
    test('phase 0.25 shifts peak to t=0', () => {
      expect(waveNodeImplementation.evaluate({ ...base, phase: 0.25 }).value).toBeCloseTo(1);
    });
    test('phase 0.5 inverts', () => {
      expect(waveNodeImplementation.evaluate({ ...base, phase: 0.5, time: 15 }).value).toBeCloseTo(-1);
    });
  });

  describe('square', () => {
    const sq = { ...base, waveType: 'square' as const };
    test('+1 in first half of cycle', () => {
      expect(waveNodeImplementation.evaluate({ ...sq, time: 6 }).value).toBe(1);
    });
    test('-1 in second half of cycle', () => {
      expect(waveNodeImplementation.evaluate({ ...sq, time: 36 }).value).toBe(-1);
    });
    test('amplitude scales output', () => {
      expect(waveNodeImplementation.evaluate({ ...sq, amplitude: 0.5, time: 6 }).value).toBe(0.5);
    });
  });

  describe('saw', () => {
    const saw = { ...base, waveType: 'saw' as const };
    test('-1 at t=0', () => {
      expect(waveNodeImplementation.evaluate(saw).value).toBeCloseTo(-1);
    });
    test('0 at midpoint (t=30)', () => {
      expect(waveNodeImplementation.evaluate({ ...saw, time: 30 }).value).toBeCloseTo(0);
    });
    test('approaches +1 near end of cycle', () => {
      expect(waveNodeImplementation.evaluate({ ...saw, time: 59.94 }).value).toBeCloseTo(1, 1);
    });
  });

  describe('reverse-saw', () => {
    const rsaw = { ...base, waveType: 'reverse-saw' as const };
    test('+1 at t=0', () => {
      expect(waveNodeImplementation.evaluate(rsaw).value).toBeCloseTo(1);
    });
    test('0 at midpoint (t=30)', () => {
      expect(waveNodeImplementation.evaluate({ ...rsaw, time: 30 }).value).toBeCloseTo(0);
    });
    test('approaches -1 near end of cycle', () => {
      expect(waveNodeImplementation.evaluate({ ...rsaw, time: 59.94 }).value).toBeCloseTo(-1, 1);
    });
  });

  describe('triangle', () => {
    const tri = { ...base, waveType: 'triangle' as const };
    test('0 at t=0', () => {
      expect(waveNodeImplementation.evaluate(tri).value).toBeCloseTo(0);
    });
    test('+1 at peak (t=15)', () => {
      expect(waveNodeImplementation.evaluate({ ...tri, time: 15 }).value).toBeCloseTo(1);
    });
    test('0 at t=30', () => {
      expect(waveNodeImplementation.evaluate({ ...tri, time: 30 }).value).toBeCloseTo(0);
    });
    test('-1 at trough (t=45)', () => {
      expect(waveNodeImplementation.evaluate({ ...tri, time: 45 }).value).toBeCloseTo(-1);
    });
    test('amplitude scales output', () => {
      expect(waveNodeImplementation.evaluate({ ...tri, amplitude: 2, time: 15 }).value).toBeCloseTo(2);
    });
  });

  describe('sampler', () => {
    test('sine: base case - does a regular cycle in 0-1', () => {

      // 🫤 We need a better way of typing the output. Gonna need to be some magic in the generation script
      const result = waveNodeImplementation.evaluate({ ...base, frequency: 1, amplitude: 1, time: 0, phase: 0, samplerTemporalImpact: 0 }) as { value: number; sampler: { sample: (t: number) => number } };
      expect(result.sampler.sample(0)).toBe(0)
      expect(result.sampler.sample(0.25)).toBeCloseTo(1)
      expect(result.sampler.sample(1)).toBeCloseTo(0)
      expect(result.sampler.sample(0.75)).toBeCloseTo(-1)
      expect(result.sampler.sample(0.5)).toBeCloseTo(0)
    });

    test('sine: frequency@2 - does two cycles in 0-1', () => {

      const result = waveNodeImplementation.evaluate({ ...base, frequency: 2, amplitude: 1, time: 0, phase: 0, samplerTemporalImpact: 0 }) as { value: number; sampler: { sample: (t: number) => number } };
      expect(result.sampler.sample(0)).toBe(0)
      expect(result.sampler.sample(1 / 8)).toBeCloseTo(1)
      expect(result.sampler.sample(2 / 8)).toBeCloseTo(0)
      expect(result.sampler.sample(3 / 8)).toBeCloseTo(-1)
      expect(result.sampler.sample(4 / 8)).toBeCloseTo(0)



    });

    test('sine: frequency@2 - with samplerTemporalImpact', () => {

      //At t=15 (one quarter of a cycle) the wave starts at the 2/8 mark above (0)
      const result = waveNodeImplementation.evaluate({ ...base, frequency: 2, amplitude: 1, time: 15, phase: 0, samplerTemporalImpact: 1 }) as { value: number; sampler: { sample: (t: number) => number } };
      expect(result.sampler.sample(0)).toBeCloseTo(0)
      expect(result.sampler.sample(1 / 8)).toBeCloseTo(-1)
      expect(result.sampler.sample(2 / 8)).toBeCloseTo(0)
      expect(result.sampler.sample(3 / 8)).toBeCloseTo(1)
      expect(result.sampler.sample(4 / 8)).toBeCloseTo(0)



    });

    describe('frequencyModulator', () => {



      // Stepwise function where t=0..0.25 = 0, t=0.25..05 = 1 etc. 
      const stepWiseSampler: { sample: (t: number) => number; sampleMany: (ts: number[]) => number[] } = {
        sample: (t) => (Math.floor(t * 4)),
        sampleMany: (ts) => ts.map(() => 1),
      };

      expect(stepWiseSampler.sample(0.24)).toBe(0);
      expect(stepWiseSampler.sample(0.25)).toBe(1);
      expect(stepWiseSampler.sample(0.26)).toBe(1);

      const ourBase = {
        ...base,
        frequency: 1,
        amplitude: 1,
        frequencyModulator: stepWiseSampler

      }


      // ☝️ These next three cases are basically repeating what has already been tested. 
      // But useful for me as I write the test



      // Base case, regular sine wave at freq=1
      // Regular time based values
      // The sampler has no effect on the time based values

      it("base time based values", () => {
        expect(waveNodeImplementation.evaluate({
          ...ourBase,
          time: 0,
        }).value).toBeCloseTo(0)

        expect(waveNodeImplementation.evaluate({
          ...ourBase,
          time: 15,
        }).value).toBeCloseTo(1)

        expect(waveNodeImplementation.evaluate({
          ...ourBase,
          time: 30,
        }).value).toBeCloseTo(0)

        expect(waveNodeImplementation.evaluate({
          ...ourBase,
          time: 45,
        }).value).toBeCloseTo(-1)


      })

      it("space based sampling with no temporal impact - f=1", () => {

        const evaluationResultNoModulation = waveNodeImplementation.evaluate({
          ...ourBase,
          frequencyModulator: null,
          time: 0,
        }) as {
          // Because the typings are directly generated from JSON Schema, we don't actually have typing for the sampler functions
          value: number; sampler: { sample: (t: number) => number }
        }
        //Space based values - no modulation, no temporal impact
        expect(evaluationResultNoModulation.sampler.sample(0)).toBeCloseTo(0)
        expect(evaluationResultNoModulation.sampler.sample(0.125)).toBeCloseTo(0.707);

        expect(evaluationResultNoModulation.sampler.sample(0.25)).toBeCloseTo(1)
        expect(evaluationResultNoModulation.sampler.sample(0.375)).toBeCloseTo(0.707) // the down slope

        expect(evaluationResultNoModulation.sampler.sample(0.5)).toBeCloseTo(0)
        expect(evaluationResultNoModulation.sampler.sample(0.75)).toBeCloseTo(-1)

      })


      it("space based sampling with no temporal impact - f=2", () => {

        const evaluationResultNoModulation = waveNodeImplementation.evaluate({
          ...ourBase,
          frequencyModulator: null,
          frequency: 2,
          time: 0,
        }) as {
          // Because the typings are directly generated from JSON Schema, we don't actually have typing for the sampler functions
          value: number; sampler: { sample: (t: number) => number }
        }
        // f=2 completes two cycles over 0–1, so quarter-cycle landmarks are at 0.125 intervals
        expect(evaluationResultNoModulation.sampler.sample(0)).toBeCloseTo(0)
        expect(evaluationResultNoModulation.sampler.sample(0.125)).toBeCloseTo(1)    // peak at 1/8

        expect(evaluationResultNoModulation.sampler.sample(0.25)).toBeCloseTo(0)    // zero crossing
        expect(evaluationResultNoModulation.sampler.sample(0.375)).toBeCloseTo(-1)  // trough at 3/8

        expect(evaluationResultNoModulation.sampler.sample(0.5)).toBeCloseTo(0)     // full first cycle
        expect(evaluationResultNoModulation.sampler.sample(0.75)).toBeCloseTo(0)    // full second cycle at 0.75

      })


      it("space based sampling with no temporal impact - f=3", () => {

        const result = waveNodeImplementation.evaluate({
          ...ourBase,
          frequencyModulator: null,
          frequency: 3,
          time: 0,
        }) as { value: number; sampler: { sample: (t: number) => number } }

        // f=3: three cycles over 0–1, quarter-cycle landmarks at 1/12 intervals
        expect(result.sampler.sample(0)).toBeCloseTo(0)       // zero
        expect(result.sampler.sample(1 / 12)).toBeCloseTo(1)    // peak  (cycle 1)
        expect(result.sampler.sample(2 / 12)).toBeCloseTo(0)    // zero
        expect(result.sampler.sample(3 / 12)).toBeCloseTo(-1)   // trough
        expect(result.sampler.sample(4 / 12)).toBeCloseTo(0)    // zero  (end of cycle 1)
        expect(result.sampler.sample(5 / 12)).toBeCloseTo(1)    // peak  (cycle 2)
        expect(result.sampler.sample(6 / 12)).toBeCloseTo(0)    // zero
        expect(result.sampler.sample(7 / 12)).toBeCloseTo(-1)   // trough
        expect(result.sampler.sample(8 / 12)).toBeCloseTo(0)    // zero  (end of cycle 2)
        expect(result.sampler.sample(9 / 12)).toBeCloseTo(1)    // peak  (cycle 3)
        expect(result.sampler.sample(10 / 12)).toBeCloseTo(0)   // zero
        expect(result.sampler.sample(11 / 12)).toBeCloseTo(-1)  // trough

      })


      it("space based sampling with no temporal impact - f=4", () => {

        const result = waveNodeImplementation.evaluate({
          ...ourBase,
          frequencyModulator: null,
          frequency: 4,
          time: 0,
        }) as { value: number; sampler: { sample: (t: number) => number } }

        // f=4: four cycles over 0–1, quarter-cycle landmarks at 1/16 intervals
        expect(result.sampler.sample(0)).toBeCloseTo(0)         // zero
        expect(result.sampler.sample(1 / 16)).toBeCloseTo(1)      // peak  (cycle 1)
        expect(result.sampler.sample(2 / 16)).toBeCloseTo(0)      // zero
        expect(result.sampler.sample(3 / 16)).toBeCloseTo(-1)     // trough
        expect(result.sampler.sample(4 / 16)).toBeCloseTo(0)      // zero  (end of cycle 1)
        expect(result.sampler.sample(5 / 16)).toBeCloseTo(1)      // peak  (cycle 2)
        expect(result.sampler.sample(6 / 16)).toBeCloseTo(0)      // zero
        expect(result.sampler.sample(7 / 16)).toBeCloseTo(-1)     // trough
        expect(result.sampler.sample(8 / 16)).toBeCloseTo(0)      // zero  (end of cycle 2)
        expect(result.sampler.sample(9 / 16)).toBeCloseTo(1)      // peak  (cycle 3)
        expect(result.sampler.sample(10 / 16)).toBeCloseTo(0)     // zero
        expect(result.sampler.sample(11 / 16)).toBeCloseTo(-1)    // trough
        expect(result.sampler.sample(12 / 16)).toBeCloseTo(0)     // zero  (end of cycle 3)
        expect(result.sampler.sample(13 / 16)).toBeCloseTo(1)     // peak  (cycle 4)
        expect(result.sampler.sample(14 / 16)).toBeCloseTo(0)     // zero
        expect(result.sampler.sample(15 / 16)).toBeCloseTo(-1)    // trough

      })


      it("space based sampling with temporal impact", () => {
        // No modulation, but temporal impact is applied, which essentially shifts the phase around one step
        const evaluationResultNoModulationWithTemporalImpact = waveNodeImplementation.evaluate({
          ...ourBase,
          frequencyModulator: null,
          time: 15, // 👈 0.25 of a phase
          samplerTemporalImpact: 1 // 👈 full effect
        }) as {
          // Because the typings are directly generated from JSON Schema, we don't actually have typing for the sampler functions
          value: number; sampler: { sample: (t: number) => number }
        }
        //Space based values - no modulation, with temporal impact
        expect(evaluationResultNoModulationWithTemporalImpact.sampler.sample(0)).toBeCloseTo(1) // 👈 sampling '0' effectively samples 0.25
        expect(evaluationResultNoModulationWithTemporalImpact.sampler.sample(0.125)).toBeCloseTo(0.707) //👈 note that this has the same value as the 0 temporal impact, because it's on the down slope 
        expect(evaluationResultNoModulationWithTemporalImpact.sampler.sample(0.25)).toBeCloseTo(0)
        expect(evaluationResultNoModulationWithTemporalImpact.sampler.sample(0.375)).toBeCloseTo(-0.707)

        expect(evaluationResultNoModulationWithTemporalImpact.sampler.sample(0.5)).toBeCloseTo(-1)
        expect(evaluationResultNoModulationWithTemporalImpact.sampler.sample(0.75)).toBeCloseTo(0)
      })

      it("space based sampling with frequencyModulation", () => {
        // ☝️ Now actually testing the frequency modulator 
        const evaluationResultStepWiseModulation = waveNodeImplementation.evaluate({
          ...ourBase,
          frequencyModulator: stepWiseSampler,
          time: 0,
          samplerTemporalImpact: 0
        }) as {
          // Because the typings are directly generated from JSON Schema, we don't actually have typing for the sampler functions
          value: number; sampler: { sample: (t: number) => number }
        }

        // effective freq =1
        expect(evaluationResultStepWiseModulation.sampler.sample(0)).toBeCloseTo(0);
        expect(evaluationResultStepWiseModulation.sampler.sample(0.125)).toBeCloseTo(0.707);

        // effective freq =2
        expect(evaluationResultStepWiseModulation.sampler.sample(0.25)).toBeCloseTo(0)
        expect(evaluationResultStepWiseModulation.sampler.sample(0.375)).toBeCloseTo(-1);

        //effective freq = 3
        expect(evaluationResultStepWiseModulation.sampler.sample(0.5)).toBeCloseTo(0);
        expect(evaluationResultStepWiseModulation.sampler.sample(7 / 12)).toBeCloseTo(-1);
        expect(evaluationResultStepWiseModulation.sampler.sample(8 / 12)).toBeCloseTo(0);



        //effective freq = 4
        expect(evaluationResultStepWiseModulation.sampler.sample(12 / 16)).toBeCloseTo(0)     // zero  (end of cycle 3)
        expect(evaluationResultStepWiseModulation.sampler.sample(13 / 16)).toBeCloseTo(1)     // peak  (cycle 4)
        expect(evaluationResultStepWiseModulation.sampler.sample(14 / 16)).toBeCloseTo(0)



      })














    });

    test('amplitudeModulator: constant +1 doubles effective amplitude', () => {
      // A modulator that always returns 1 causes effectiveAmplitude = amplitude * (1 + 1) = 2.
      const constantPlusOne: { sample: (t: number) => number; sampleMany: (ts: number[]) => number[] } = {
        sample: () => 1,
        sampleMany: (ts) => ts.map(() => 1),
      };

      const modulated = waveNodeImplementation.evaluate({
        ...base,
        frequency: 1,
        amplitude: 1,
        time: 0,
        samplerTemporalImpact: 0,
        amplitudeModulator: constantPlusOne as unknown as null,
      }) as { value: number; sampler: { sample: (t: number) => number } };

      // At fractionOfOneCycle=0.25, sine=1; with effectiveAmplitude=2 result should be 2.
      expect(modulated.sampler.sample(0.25)).toBeCloseTo(2);
      // At fractionOfOneCycle=0.75, sine=-1; with effectiveAmplitude=2 result should be -2.
      expect(modulated.sampler.sample(0.75)).toBeCloseTo(-2);
      // Zero crossing is unaffected by amplitude.
      expect(modulated.sampler.sample(0)).toBeCloseTo(0);
    });

  });
});
