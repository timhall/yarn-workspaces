"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function add() {
    const dir = process.cwd();
    console.log('add', dir);
}
exports.add = add;
async function list() {
    console.log('list');
}
exports.list = list;
async function show(fingerprint) {
    console.log('show', fingerprint);
}
exports.show = show;
async function clear() {
    console.log('clear');
}
exports.clear = clear;
