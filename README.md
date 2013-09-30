# Backbone Comments Example with Encryption

This demo uses the Backbone Comments example as a basis for testing the [Stanford Javascript Crypto Library](http://crypto.stanford.edu/sjcl/)

It uses a modified version of backbone-couchdb.js to make the encryption as seamless as possible

Set the encryption password in app.js:

    Backbone.couch_connector.config.encryption_password = "iWouldGoOutTonight";

Note that if you change the password, you'll need to generate a new key and change the settings in backbone-couchdb.js

    encryptedJsonDefaults: { v:1, iter:1000, ks:256, ts:64, mode:"ccm", adata:"", cipher:"aes"},
    iv: "7015C150 175DC714 8870D563 E9099C4C",
    salt: "EF6BC741 95BE4F70",
    key: "DFC5F044 79957FDC 0A6F54B3 C8B4512C 0D86DAF4 E96AE8A6 69D82B15 439C0175"

View the demo at http://localhost:5984/tangelo/_design/backbone_couchapp_comments/index.html

# Details

The SJCL library encrypt function returns an object that includes the salt, initialization vector(i.v.), key in addition to other static properties:

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






