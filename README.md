# Backbone Comments Example with Encryption

This demo uses the Backbone Comments example as a basis for testing the [Stanford Javascript Crypto Library](http://crypto.stanford.edu/sjcl/)

It uses a modified version of backbone-couchdb.js to make the encryption as seamless as possible.

Set the encryption password, salt, and initialization vector(iv) in app.js:

    Backbone.couch_connector.config.encryption_password = "iWouldGoOutTonight";
    Backbone.couch_connector.config.iv = "7015C150 175DC714 8870D563 E9099C4C";
    Backbone.couch_connector.config.salt =  "EF6BC741 95BE4F70";

Note that if you change the password, you'll need to generate new salt and iv. The [SJLC demo](http://bitwiseshiftleft.github.io/sjcl/demo/) is a handy tool for this.

You may also change more encryption settings in backbone-couchdb.js. Setting the key *might* speed things up a tad.
The key is computed from the password, salt and strengthening factor. It will be used internally by the cipher.

    Backbone.couch_connector.config.key =  null;
    Backbone.couch_connector.config.encryptedJsonDefaults = { v:1, iter:1000, ks:256, ts:64, mode:"ccm", adata:"", cipher:"aes"}

The encryptDocument/decryptDocument functions for this demo are in coconut-utils-extra.js. Those two functions encrypt/decrypt all of the values
in the document except for_id, _rev, and collection properties.

View the demo at http://localhost:5984/tangelo/_design/backbone_couchapp_comments/index.html

# Details

The SJCL library encrypt function returns an object that includes the salt, initialization vector(iv), key in addition to other static properties:

        {"iv":"wevkdWea1szC9M8bq4TMUw==",
        "v":1,
        "iter":1000,
        "ks":256,
        "ts":64,
        "mode":"ccm",
        "adata":"",
        "cipher":"aes",
        "salt":"xYngJZoe7sw=",
        "ct":"KmUYro/nkG/5LthU"}

The demo currently stores only the ciphertext (ct), which is the encrypted value, in order to reduce the amount of redundant data stored in the database.
This measure does result in a compromise in the security of the data stored; it is preferable to have randomly-generated i.v. and salt.






