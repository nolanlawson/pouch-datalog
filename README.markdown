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

More examples will be forthcoming, but, for now, please see [Learn Datalog Today](http://www.learndatalogtoday.org/), [Datascript](https://github.com/tonsky/datascript), and the [Datomic documentation](http://docs.datomic.com/query.html) for examples that may or may not work with `pouch-datalog`.

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

# Do I need to store my data in triples?

No, you just need indexes in triples. For instance, if you have documents of the form:

```
{
    _id: _________,
    first_name: "Philip",
    last_name: "King",
    car: "fast"
}
```

You could create a `ave` view with something like the following:

```
function( doc ) {
    for (var key in doc) {
        if ( key !== "_id" ) {
            emit( [doc._id, key, doc[ key ]], [doc._id, key, doc[ key ]] ); // [2]
        }
    }
}
```

# Customizing Indexes

The sky is the limit as to customizing the indexes. Don't include some documents or parameters, transform values before putting them in the index, whatever.


# Drawbacks

- **Speed.** At the very least, you will likely be making several HTTP requests per query. It is very possible there are some possible optimizations here. Additionally, I've read that views are not necessarily as fast as you wish they would be.
- **Indexes**. The indexes will dramatically inflate the amount of storage space your database requires. The trade-off may or may not be worth it, depending on your application.

# Comparison Against Cloudant Query?

I don't have any experience with Cloudant query, but I'm guessing that it would have smaller indexes (since they aren't indexing everything, and wouldn't have some of the cool logic programming bits that Datalog does. Cloudant Query is probably far more production-ready, though not generally available just yet. Cloudant query will, of course, eventually be the standard for CouchDB.

[1] They may actually use 3 or 4 indexes, all of which typically have a fourth term 'T' in them, but we can ignore that for now.
[2] Yes, I realize one shouldn't need to emit anything for the `value` here. Coming soon…pull requests welcome.