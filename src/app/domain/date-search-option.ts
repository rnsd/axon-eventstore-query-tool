import {TimeUnit} from "./time-unit";


export class DateSearchOption {

  constructor(public readonly description: string,
                      public readonly quantity: number,
                      public readonly unit: TimeUnit) {
  }

}
