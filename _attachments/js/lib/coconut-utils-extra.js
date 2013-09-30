function encryptDocument(model, defaults, password, salt, iv) {
    var modelAttributes = model.attributes;
    for (var key in modelAttributes) {
        if (modelAttributes.hasOwnProperty(key)) {
            if ((key !== "_id") && (key !== "_rev") && (key !== "collection")) {
                var __ret = encryptValue(modelAttributes, defaults, password, salt, iv, key);
                var value = __ret.value;
                var json = __ret.json;
                var ivHex = __ret.ivHex;
                var saltHex = __ret.saltHex;
                var ct = __ret.ct;
                var ciphertext = __ret.ciphertext;
                //console.log(key + " -> " + value + " -> " + ciphertext);
                var props = {};
                props[key] = ciphertext;
                model.set(props, {silent: true})
            }
        }
    }
}

function encryptValue(modelAttributes, defaults, password, salt, iv, key) {
    var value = modelAttributes[key];
    var json = {};
    var ivHex = sjcl.codec.hex.toBits(iv)
    var saltHex = sjcl.codec.hex.toBits(salt);
    _.extend(json, defaults, {"iv": ivHex }, {"salt": saltHex});
    var ct = sjcl.encrypt(password, value.toString(), json).replace(/,/g, ",\n");
    var ciphertext = ct.match(/"ct":"([^"]*)"/)[1];
    return {value: value, json: json, ivHex: ivHex, saltHex: saltHex, ct: ct, ciphertext: ciphertext};
}

function decryptDocument(doc, defaults, password, salt, iv, key) {
    var currentDoc = doc.value
    for (var property in currentDoc) {
        if (currentDoc.hasOwnProperty(property)) {
            if ((property !== "_id") && (property !== "_rev") && (property !== "collection")) {
                var value = currentDoc[property];
                var plaintext = decryptValue(value, defaults, password, salt, iv, key);
                currentDoc[property] = plaintext;
            }
        }
    }
    return currentDoc;
}

function decryptValue(value, defaults, password, salt, iv, key) {
    var plaintext;
    var keyhex = "";
    var ciphertext = sjcl.codec.base64.toBits(value);
    var json = {};
    var ivhex = sjcl.codec.hex.toBits(iv);
    var salthex = sjcl.codec.hex.toBits(salt);
    if (key !== null) {
        keyhex = sjcl.codec.hex.toBits(key);
    }
    _.extend(json, defaults, {"iv": ivhex }, {"ct": value },
        {"password": password }, {"salt": salthex }, {"key": "" });
    // adds key to json
    if (json.key.length === 0) {
        doPbkdf2(json, true);
    }
    var aes = new sjcl.cipher.aes(json.key);
    var adata = defaults.adata;
    var mode = defaults.mode
    var tag = parseInt(defaults.ts)
    plaintext = sjcl.codec.utf8String.fromBits(sjcl.mode[mode].decrypt(aes, ciphertext, ivhex, adata, tag));
    //console.log(property + " -> " + value + " -> " + plaintext);
    return plaintext;
}

// kudos: sjcl - computes the key
/* compute PBKDF2 on the password. */
function doPbkdf2(v, decrypting) {
  var salt=v.salt, key, hex = sjcl.codec.hex.fromBits, p={}, password = v.password;

  p.iter = v.iter;

  if (password.length == 0) {
    if (decrypting) { error("Can't decrypt: need a password!"); }
    return;
  }

  if (salt.length === 0 && decrypting) {
    error("Can't decrypt: need a salt for PBKDF2!");
    return;
  }

  if (decrypting || !v.freshsalt || !usedSalts[v.salt]) {
    p.salt = v.salt;
  }

  p = sjcl.misc.cachedPbkdf2(password, p);
  //form._extendedKey = p.key;
  v.key = p.key.slice(0, v.ks/32);
  v.salt = p.salt;
}