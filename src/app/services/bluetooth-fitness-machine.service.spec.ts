import { ToastrService } from 'ngx-toastr';
import { BluetoothFitnessMachineService } from './bluetooth-fitness-machine.service';
import { IndoorBikeData, ProcessingPipeline } from './fitness-machine.service';

describe('BluetoothFitnessMachineService measurement notifications', () => {
  function setup() {
    const pipeline = jasmine.createSpyObj<ProcessingPipeline>('pipeline', ['process', 'reset']);
    pipeline.process.and.callFake((data: IndoorBikeData) => ({ ...data, calculatedGrade: 2 }));
    const service = new BluetoothFitnessMachineService(
      jasmine.createSpyObj<ToastrService>('toastr', ['info']), pipeline,
    );
    const control = spyOn(service, 'setIndoorBikeSimulationParameters').and.resolveTo();
    const published = jasmine.createSpy('published');
    service.indoorBikeData$.subscribe(published);
    const notify = (bytes: Uint8Array) => service['onIndoorBikeDataChanged']({
      target: { value: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength) },
    } as unknown as Event);
    return { service, pipeline, control, published, notify };
  }

  it('drops every truncated prefix before processing, control or publication', () => {
    const { service, pipeline, control, published, notify } = setup();
    const packet = Uint8Array.of(0x44, 0x00, 0x10, 0x0e, 0xb4, 0x00, 0xfa, 0x00);
    for (let length = 0; length < packet.length; length++) {
      notify(packet.subarray(0, length));
    }
    expect(pipeline.process).not.toHaveBeenCalled();
    expect(control).not.toHaveBeenCalled();
    expect(published).not.toHaveBeenCalled();
    expect(service.lastGrade).toBe(0);
  });

  it('keeps the existing processing and publication path for complete packets', () => {
    const { service, pipeline, control, published, notify } = setup();
    notify(Uint8Array.of(0x44, 0x00, 0x10, 0x0e, 0xb4, 0x00, 0xfa, 0x00));
    expect(pipeline.process).toHaveBeenCalledTimes(1);
    expect(published).toHaveBeenCalledWith(jasmine.objectContaining({
      instantaneousSpeed: 36, instantaneousCadence: 90, instantaneousPower: 250,
      calculatedGrade: 2,
    }));
    expect(control).toHaveBeenCalledOnceWith(0, 2, 0, 0);
    expect(service.lastGrade).toBe(2);
  });
});
