function encrypt(model, defaults, password, salt, iv) {
    var modelAttributes = model.attributes;
    for (var key in modelAttributes) {
        if (modelAttributes.hasOwnProperty(key)) {
            var value = modelAttributes[key];
            var json = {};
            var ivHex = sjcl.codec.hex.toBits(iv)
            var saltHex = sjcl.codec.hex.toBits(salt);
            _.extend(json, defaults, {"iv": ivHex }, {"salt": saltHex});
            var ct = sjcl.encrypt(password, value.toString(), json).replace(/,/g, ",\n");
            var ciphertext = ct.match(/"ct":"([^"]*)"/)[1];
            //console.log(key + " -> " + value + " -> " + ciphertext);
            var props = {};
            props[key] = ciphertext;
            model.set(props, {silent: true})
        }
    }
}

function decrypt(value, defaults, password, salt, iv, key) {
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

// kudos: sjcl
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