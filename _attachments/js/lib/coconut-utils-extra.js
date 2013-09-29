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