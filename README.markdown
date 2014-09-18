# pouch-datalog

Datomic-like Datalog queries for PouchDB! (See [Learn Datalog Today](http://www.learndatalogtoday.org/) for some examples of how Datalog works.)

The query engine is a fork from [Datascript](https://github.com/tonsky/datascript).

# Ready?

Probably not. Give it a spin, make pull requests, and we'll see if we can't get ready! I expect I've added bugs galore to the basic query engine. Contributions gladly welcome.

# Usage

```
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouch-datalog'));

db.dataquery('[:find ?id \
                :in \
                :where [?id "last_name" "Benson"]]')
    .then(function (response) {
        console.log( response ); // [['1']], i.e. the id of the document that matched
    });
```

# How?

[Datomic](http://www.datomic.com/) and [Datascript](https://github.com/tonsky/datascript) make use of the Datalog query engine against `EAV` and `AVE` indexes.[1] They are shorthand for `entity`-`attribute`-`value` and `attribute`-`value`-`entity`. (`entity` corresponds to `id` and `attribute` to `key` in more common Javascript parlance.) We can use Datalog against CouchDB if we also provide such indexes via views.

`pouch-datalog` expects two views: once called `ave` in a design document called `ave`, and another called `eav` in a design document called `eav`.

For instance, say that you've emulated [triple store](https://en.wikipedia.org/wiki/Triplestore) in PouchDB, and have documents that look like the following:

```
{
    _id: ________,
    id: 0,
    key: "last_name",
    value: "Benson"
}
```

Then, you'd want to have a `map` function in your `ave` view something like the following:

```
function( doc ) {
    emit( [doc.key, doc.value, doc.id], [doc.id, doc.key, doc.value] ); // [2]
}
```

and the `eav` something like:

```
function( doc ) {
    emit( [doc.id, doc.key, doc.value], [doc.id, doc.key, doc.value] ); // [2]
}
```

Voila! Datalog at your disposal.

# Comparison Against Cloudant Query?

I don't have any experience with Cloudant query, but I'm guessing that it would have smaller indexes (since they aren't indexing everything, and wouldn't have some of the cool logic programming bits that Datalog does. On the flip side, it is probably far more production-ready.

[1] They may actually use 3 or 4 indexes, all of which typically have a fourth term 'T' in them, but we can ignore that for now.
[2] Yes, I realize one shouldn't need to emit anything for the `value` here. Coming soon…pull requests welcome.