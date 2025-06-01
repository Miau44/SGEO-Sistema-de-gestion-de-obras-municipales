

                    export class DecimalUtil {
                        static roundToDecimals(value: number, decimals: 2 | 5): number {
                          const fixed5 = value.toFixed(5); 
                          if (decimals === 2) {
                            const [intPart, decPart = ''] = value.toFixed(2).split('.');
                            const padded = decPart.padEnd(5, '0'); 
                            return parseFloat(`${intPart}.${padded}`);
                          }
                      
                          
                          return parseFloat(fixed5);
                        }
                      }
                      
                  
              
          
      
  

  