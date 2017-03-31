var textSearch = document.getElementsByName("searchText")[0].value;

db.collection.find(
      {$text: {$search: textSearch}}
      {score: {$meta: "textScore"}}
    ).sort({score: {$meta: "textScore"}})