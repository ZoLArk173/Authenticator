import jsSHA from "./sha.js"

export default function(account, secret, issuer) {

    function dec2hex(s) { return (s < 15.5 ? '0' : '') + Math.round(s).toString(16); }
    function hex2dec(s) { return parseInt(s, 16); }
    function base32tohex(base32) {
        var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var bits = "";
        var hex = "";
      
        // strip padding and whitespace; uppercase for lookup
        var clean = base32.toUpperCase().replace(/=+$/,'').replace(/\s+/g,'');
      
        for (var i = 0; i < clean.length; i++) {
          var c = clean.charAt(i);
          var val = base32chars.indexOf(c);
          if (val === -1) {
            throw new Error("Invalid Base32 character: " + c);
          }
          bits += leftpad(val.toString(2), 5, '0');
        }
      
        // keep only full bytes (8 bits)
        bits = bits.slice(0, bits.length - (bits.length % 8));
      
        // convert each byte to two hex chars
        for (var i = 0; i < bits.length; i += 8) {
          var byte = bits.slice(i, i + 8);
          hex += leftpad(parseInt(byte, 2).toString(16), 2, '0');
        }
        return hex;
      }

    function leftpad(str, len, pad) {
        if (str.length < len) {
            str = Array(len + 1 - str.length).join(pad) + str;
        }
        return str;
    }

    this.getOtp = function() {

        var key = base32tohex(secret);
        var epoch = Math.round(new Date().getTime() / 1000.0);
        var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');

        // // updated for jsSHA v2.0.0 - http://caligatio.github.io/jsSHA/
        var shaObj = new jsSHA("SHA-1", "HEX");
        shaObj.setHMACKey(key, "HEX");
        shaObj.update(time);
        var hmac = shaObj.getHMAC("HEX");

        var GsecretHex = String(key);
        var GsecretHexLength = String((key.length * 4) + ' bits');
        var Gepoch = String(time);

        if (hmac == 'KEY MUST BE IN BYTE INCREMENTS') {
        } else {
            var offset = hex2dec(hmac.substring(hmac.length - 1));
        }

        var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
        otp = (otp).substr(otp.length - 6, 6);
        return String(otp);
    }
}
