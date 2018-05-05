// Left-pad a number with 0s
function pad(num, digits)
{
    var ret = "" + num;
    while(ret.length < digits)
        ret = "0" + ret;
    return ret;
}

export function centsToString(cents) {
    return ("$" + Math.floor(cents/100) + "." + pad(cents%100, 2));
}