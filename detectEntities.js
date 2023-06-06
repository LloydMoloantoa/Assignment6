const { text } = require('express');
//Import NerManager from the nlp package
const { NerManager } = require('node-nlp');

let entity, value;
async function findInfo(d){
    

    //Initialize a manager obj, threshold is the accuracy of the predictions
    const manager = new NerManager({ threshhold: 0.8 });
    //Looks for the entities and displays them to the console
    data = manager.findEntities(
       d,
    ).then(entities => {
        entities.forEach(ent => {
            entity = ent["entity"];
            value = ent["sourceText"];
            console.log(`${entity}:${value}`)
        });
    })
}

module.exports = {
    findInfo, 
}