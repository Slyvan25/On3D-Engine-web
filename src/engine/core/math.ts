// math.ts — Core math primitives for the WebOn3D engine.
// Works independently of Three.js but includes conversion helpers.

import * as THREE from "three";

// -------------------------------------------------------------
// Vector2
// -------------------------------------------------------------
export class Vector2 {
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  static fromThree(v: THREE.Vector2) {
    return new Vector2(v.x, v.y);
  }

  toThree() {
    return new THREE.Vector2(this.x, this.y);
  }

  add(v: Vector2) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}

// -------------------------------------------------------------
// Vector3
// -------------------------------------------------------------
export class Vector3 {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
  ) {}

  static fromThree(v: THREE.Vector3) {
    return new Vector3(v.x, v.y, v.z);
  }

  toThree() {
    return new THREE.Vector3(this.x, this.y, this.z);
  }

  add(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v: Vector3) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  normalize() {
    const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (len > 0) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
    }
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
}

// -------------------------------------------------------------
// Quaternion
// -------------------------------------------------------------
export class Quaternion {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
    public w = 1,
  ) {}

  static fromThree(q: THREE.Quaternion) {
    return new Quaternion(q.x, q.y, q.z, q.w);
  }

  toThree() {
    return new THREE.Quaternion(this.x, this.y, this.z, this.w);
  }

  setFromAxisAngle(axis: Vector3, rad: number) {
    const half = rad / 2;
    const s = Math.sin(half);

    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(half);

    return this;
  }

  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }
}

// -------------------------------------------------------------
// Matrix4
// -------------------------------------------------------------
export class Matrix4 {
  private _m = new THREE.Matrix4();

  static fromThree(m: THREE.Matrix4) {
    const mat = new Matrix4();
    mat._m.copy(m);
    return mat;
  }

  toThree() {
    return this._m.clone();
  }

  compose(pos: Vector3, rot: Quaternion, scale: Vector3) {
    this._m.compose(pos.toThree(), rot.toThree(), scale.toThree());
    return this;
  }

  clone() {
    const m = new Matrix4();
    m._m.copy(this._m);
    return m;
  }
}

// -------------------------------------------------------------
// Utilities
// -------------------------------------------------------------
export const degToRad = (deg: number) => (deg * Math.PI) / 180;
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;
