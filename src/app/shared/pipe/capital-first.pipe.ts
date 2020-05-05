import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalFirst'
})
export class CapitalFirstPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return value.charAt(0).toLocaleUpperCase() + value.slice(1); 
  }

}
