export function encode (value) {
    return (value << 1) ^ (value >> 31);
}

export function decode (value) {
    return (value >> 1) ^ (-(value & 1));
}