import Plugin from '@goosemod/plugin';
import { internalMessage } from '@goosemod/patcher';

import { switch_known_errcode_ranges, modules } from './data';


class SwitchErrorLookup extends Plugin {
  onImport() {
    this.command('nxerr', 'Get info on Switch error codes', ({ error: [ { text } ] }) => {
      let err = text;
      
      let module = 0;
      let desc = 0;
      let errcode = 0;
      
      if (err.startsWith('0x')) {
        err = err.substring(2);
        errcode = parseInt(err, 16);
        module = errcode & 0x1FF;
        desc = (errcode >> 9) & 0x3FFF;
      }
      
      if (err.includes('-')) {
        module = parseInt(err.substring(0, 4)) - 2000;
        desc = parseInt(err.substring(5, 9));
        errcode = (desc << 9) + module
      }
      
      let out = modules[module][desc];
      
      if (!out) {
        const knownRanges = switch_known_errcode_ranges[module];
        if (knownRanges) {
          for (const range of knownRanges) {
            if (desc >= range[0] && desc <= range[1]) {
              out = range[2];
            }
          }
        }
      }
      
      internalMessage({
        type: 'rich',
        
        title: `${(module + 2000).toString().substring(0, 4)}-${desc.toString().substring(0, 4)} / 0x${errcode.toString(16)}`,
        description: out,
        
        fields: [
          { name: 'Module', value: module.toString(), inline: true },
          { name: 'Description', value: desc.toString(), inline: true }
        ]
      });
    }, [ { type: 3, required: true, name: 'error', description: 'Error code' } ]);
  }
};

export default new SwitchErrorLookup();