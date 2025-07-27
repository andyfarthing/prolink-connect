import {bpmToSeconds} from 'src/utils';

describe('bpmToSeconds', () => {
  it('computes 60 bpm at 0 pitch as 1 second per beat', () => {
    expect(bpmToSeconds(60, 0)).toEqual(1);
  });

  it('computes 120 bpm at 0 pitch as 0.5 seconds per beat', () => {
    expect(bpmToSeconds(120, 0)).toEqual(0.5);
  });

  it('computes 60 bpm at 25 pitch as 0.8 seconds per beat', () => {
    expect(bpmToSeconds(60, 25)).toEqual(0.8);
  });
});
