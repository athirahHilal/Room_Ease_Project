/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_225413430")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3339701323",
    "hidden": false,
    "id": "relation3061890488",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "currentRoomID",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_225413430")

  // remove field
  collection.fields.removeById("relation3061890488")

  return app.save(collection)
})
