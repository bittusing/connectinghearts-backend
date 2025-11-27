module.exports = {
      convertJson: (jsonData) => {
            const result = {};

            jsonData.forEach((category) => {
              Object.keys(category).forEach((categoryName) => {
                const values = category[categoryName];
          
                if (!result[categoryName]) {
                  result[categoryName] = {};
                }
          
                values.forEach((value) => {
                  result[categoryName][value.value] = value.label;
                });
              });
            });
          
            return result ;
      },
      hashMapifyLabelValue:(jsonData)=>{
            let obj={};
            console.log(jsonData)
            jsonData.forEach((each_obj)=>{
                  obj[each_obj.value]=each_obj.label
            })
            return obj;
      }
}