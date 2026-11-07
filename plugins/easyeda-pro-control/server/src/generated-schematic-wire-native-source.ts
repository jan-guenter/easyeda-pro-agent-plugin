/** Source-only exact native geometry/derived-marker roster. Full-file identity is
 * supplied by GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE; no live authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE = freezeDeep([
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "methods": {
      "pointNormal": {
        "start": 1_703_781,
        "end": 1_703_874,
        "sha256": "7cb4de0e731c4804803760f47f140b08c6b86b5851593e6bcc623d8e83976032",
        "lineNumber": 58,
        "columnNumber": 65_152
      },
      "pointConstructor": {
        "start": 1_706_618,
        "end": 1_709_687,
        "sha256": "7f80924266622384fc092586074547615346c67532b3a8cc9a18958c4b07974c",
        "lineNumber": 58,
        "columnNumber": 67_989,
        // oxlint-disable-next-line no-template-curly-in-string -- Exact vendor function text includes its own template literals.
        "source": "class dl{static sortByXAsc(e,t){return e.x-t.x}static sortByYAsc(e,t){return e.y-t.y}static sortByXYAsc(e,t){return e.x<t.x?-1:e.x>t.x?1:e.y-t.y}static normal(e,t,r){let n=t.sub(e),s=r.sub(t);return n.cross(s)}static getVector2(e){return new dl(Math.cos(e),Math.sin(e))}static getKey(e,t){return`${e}|${t}`}static getCrossPoint1(e,t,r,n){if(e.equals1(t)||r.equals1(n)||Yt.eq(1,Math.abs(t.sub(e).normalize().dot(n.sub(r).normalize()))))return null;let s=t.y-e.y,a=e.x-t.x,o=t.x*e.y-e.x*t.y,l=n.y-r.y,c=r.x-n.x,u=n.x*r.y-r.x*n.y,h=s*c-l*a;return new dl((u*a-o*c)/h,(o*l-u*s)/h)}static getCrossPoint2(e,t,r,n){return this.getCrossPoint1(e,e.add(t),r,r.add(n))}get key(){return this._key||(this._key=dl.getKey(this.x,this.y)),this._key}constructor(e,t){this.x=Ea.normal(e),this.y=Ea.normal(t),_he[0]=e,_he[1]=t,this.hashed=ok[0]^ok[1]^ok[2]^ok[3]}dot(e){return this.x*e.x+this.y*e.y}length(){return Math.sqrt(this.dot(this))}getCos(){return this.x/this.length()}sub(e){var t=this.x-e.x,r=this.y-e.y;return new dl(t,r)}add(e){var t=this.x+e.x,r=this.y+e.y;return new dl(t,r)}add1(e,t){return new dl(this.x+e,this.y+t)}mul(e,t=e){return new dl(this.x*e,this.y*t)}divide(e,t=e){return new dl(this.x/e,this.y/t)}cross(e){return this.x*e.y-this.y*e.x}getSin(){return this.y/this.length()}angle(e){return Math.atan2(this.y-e.y,this.x-e.x)}angleD(e){return Sr.toDegrees(this.angle(e))}distance1(e){let t=e.x-this.x,r=e.y-this.y;return oo.hypot(t,r)}distance2(e){let t=e.x-this.x,r=e.y-this.y;return t*t+r*r}rotateD(e,t){return this.rotate(e,Sr.toRadians(t))}rotate(e,t){let r=Math.cos(t),n=Math.sin(t),s=this.x-e.x,a=this.y-e.y,o=s*r+a*-n,l=s*n+a*r;return e.add1(o,l)}regular(e){return new dl(Math.round(this.x/e)*e,Math.round(this.y/e)*e)}multiply3(e){let t=this.x*e.data[0]+this.y*e.data[3]+e.data[6],r=this.x*e.data[1]+this.y*e.data[4]+e.data[7];return new dl(t,r)}multiply3Return(e,t){let r=this.x*e.data[0]+this.y*e.data[3]+e.data[6],n=this.x*e.data[1]+this.y*e.data[4]+e.data[7];return t(r,n)}hashCode(){return this.hashed}equals(e){return e instanceof dl?e.x===this.x&&e.y===this.y:!1}equals1(e){return Yt.eq(this.x,e.x)&&Yt.eq(this.y,e.y)}equals2(e,t){return Math.abs(this.x-e.x)<=t&&Math.abs(this.y-e.y)<=t}toString(){return\"Vector [X=\"+this.x+\", Y=\"+this.y+\"]\"}bbox(){let e=this.x,t=this.y;return new Ni(e,e,t,t)}normalize(){if(this.x===0&&this.y===0)return new dl(0,0);let e=this.x/this.length(),t=this.y/this.length();return new dl(e,t)}mirror(e){return e||(e=new dl(0,0)),new dl(2*e.x-this.x,2*e.y-this.y)}mirror2(e=dl.ORIGIN){return new dl(2*e.x-this.x,this.y)}round(e=4){let t=10**(e|0);return new dl(Math.round(this.x*t)/t,Math.round(this.y*t)/t)}scale(e){return new dl(this.x*e,this.y*e)}isCollinear(e){return Math.abs(this.x*e.y-this.y*e.x)<=Math.sqrt((this.x*this.x+this.y*this.y)*(e.x*e.x+e.y*e.y))*Yt.eps}isInside(e){let t=this.x>e.minX&&this.x<e.maxX;if(!e.height())return t&&this.y===e.minY;let r=this.y>e.minY&&this.y<e.maxY;return e.width()?t&&r:r&&this.x===e.minX}*[Symbol.iterator](){yield this.x,yield this.y}get[Symbol.toStringTag](){return\"Vector2\"}}"
      },
      "pointsSet": {
        "start": 3_852_030,
        "end": 3_852_175,
        "sha256": "50254cd104fa912cb79c0e86041f99981c6c8053a9b50a6164df57e857c12db6",
        "lineNumber": 3606,
        "columnNumber": 185_146
      },
      "pointsGet": {
        "start": 3_851_997,
        "end": 3_852_030,
        "sha256": "554ea2472f8d2bba679446cce1ac6c3c91c77a7a6d1fa96d5dc580690463bac9",
        "lineNumber": 3606,
        "columnNumber": 185_113
      },
      "lineData": {
        "start": 3_855_644,
        "end": 3_855_929,
        "sha256": "8925258cc628592c187f1ef2d6a7390d95f4bab9768eb9c5cee540e78a50f699",
        "lineNumber": 3606,
        "columnNumber": 188_760
      },
      "setLines": {
        "start": 3_918_102,
        "end": 3_918_587,
        "sha256": "3880c8aa2c2e509e73aeb464ee91aab65b14687642afe70d5065b7c6adbcd21c",
        "lineNumber": 3606,
        "columnNumber": 251_218
      },
      "sortChildren": {
        "start": 3_912_398,
        "end": 3_912_978,
        "sha256": "438d7fb428d2edcf118f9d18785c2c48ea9df5e896c6a1d0d197e9a77898b024",
        "lineNumber": 3606,
        "columnNumber": 245_514
      },
      "refreshNetPoint": {
        "start": 3_945_380,
        "end": 3_946_323,
        "sha256": "94d8964473f6503af3988b85dc6ceaaa698accbd2e92811a77115424ab42b9c7",
        "lineNumber": 3606,
        "columnNumber": 278_496
      },
      "netPointWatch": {
        "start": 3_946_515,
        "end": 3_946_781,
        "sha256": "330d8d332bb76b6e12a3a912d5b31fdbeece9e01b7eaaeef6e721b2cd967b05d",
        "lineNumber": 3606,
        "columnNumber": 279_631
      }
    }
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "methods": {
      "pointNormal": {
        "start": 1_900_335,
        "end": 1_900_428,
        "sha256": "7cb4de0e731c4804803760f47f140b08c6b86b5851593e6bcc623d8e83976032",
        "lineNumber": 556,
        "columnNumber": 120_689
      },
      "pointConstructor": {
        "start": 1_903_172,
        "end": 1_906_241,
        "sha256": "7af41e5d30cb5d3aefd45f54afbbc2ee8fba3d0f45bd5fd2d23072cbdacbb2eb",
        "lineNumber": 556,
        "columnNumber": 123_526,
        // oxlint-disable-next-line no-template-curly-in-string -- Exact vendor function text includes its own template literals.
        "source": "class hl{static sortByXAsc(e,t){return e.x-t.x}static sortByYAsc(e,t){return e.y-t.y}static sortByXYAsc(e,t){return e.x<t.x?-1:e.x>t.x?1:e.y-t.y}static normal(e,t,r){let n=t.sub(e),s=r.sub(t);return n.cross(s)}static getVector2(e){return new hl(Math.cos(e),Math.sin(e))}static getKey(e,t){return`${e}|${t}`}static getCrossPoint1(e,t,r,n){if(e.equals1(t)||r.equals1(n)||Yt.eq(1,Math.abs(t.sub(e).normalize().dot(n.sub(r).normalize()))))return null;let s=t.y-e.y,a=e.x-t.x,o=t.x*e.y-e.x*t.y,l=n.y-r.y,c=r.x-n.x,u=n.x*r.y-r.x*n.y,h=s*c-l*a;return new hl((u*a-o*c)/h,(o*l-u*s)/h)}static getCrossPoint2(e,t,r,n){return this.getCrossPoint1(e,e.add(t),r,r.add(n))}get key(){return this._key||(this._key=hl.getKey(this.x,this.y)),this._key}constructor(e,t){this.x=Ma.normal(e),this.y=Ma.normal(t),Rce[0]=e,Rce[1]=t,this.hashed=Yk[0]^Yk[1]^Yk[2]^Yk[3]}dot(e){return this.x*e.x+this.y*e.y}length(){return Math.sqrt(this.dot(this))}getCos(){return this.x/this.length()}sub(e){var t=this.x-e.x,r=this.y-e.y;return new hl(t,r)}add(e){var t=this.x+e.x,r=this.y+e.y;return new hl(t,r)}add1(e,t){return new hl(this.x+e,this.y+t)}mul(e,t=e){return new hl(this.x*e,this.y*t)}divide(e,t=e){return new hl(this.x/e,this.y/t)}cross(e){return this.x*e.y-this.y*e.x}getSin(){return this.y/this.length()}angle(e){return Math.atan2(this.y-e.y,this.x-e.x)}angleD(e){return vr.toDegrees(this.angle(e))}distance1(e){let t=e.x-this.x,r=e.y-this.y;return oo.hypot(t,r)}distance2(e){let t=e.x-this.x,r=e.y-this.y;return t*t+r*r}rotateD(e,t){return this.rotate(e,vr.toRadians(t))}rotate(e,t){let r=Math.cos(t),n=Math.sin(t),s=this.x-e.x,a=this.y-e.y,o=s*r+a*-n,l=s*n+a*r;return e.add1(o,l)}regular(e){return new hl(Math.round(this.x/e)*e,Math.round(this.y/e)*e)}multiply3(e){let t=this.x*e.data[0]+this.y*e.data[3]+e.data[6],r=this.x*e.data[1]+this.y*e.data[4]+e.data[7];return new hl(t,r)}multiply3Return(e,t){let r=this.x*e.data[0]+this.y*e.data[3]+e.data[6],n=this.x*e.data[1]+this.y*e.data[4]+e.data[7];return t(r,n)}hashCode(){return this.hashed}equals(e){return e instanceof hl?e.x===this.x&&e.y===this.y:!1}equals1(e){return Yt.eq(this.x,e.x)&&Yt.eq(this.y,e.y)}equals2(e,t){return Math.abs(this.x-e.x)<=t&&Math.abs(this.y-e.y)<=t}toString(){return\"Vector [X=\"+this.x+\", Y=\"+this.y+\"]\"}bbox(){let e=this.x,t=this.y;return new Di(e,e,t,t)}normalize(){if(this.x===0&&this.y===0)return new hl(0,0);let e=this.x/this.length(),t=this.y/this.length();return new hl(e,t)}mirror(e){return e||(e=new hl(0,0)),new hl(2*e.x-this.x,2*e.y-this.y)}mirror2(e=hl.ORIGIN){return new hl(2*e.x-this.x,this.y)}round(e=4){let t=10**(e|0);return new hl(Math.round(this.x*t)/t,Math.round(this.y*t)/t)}scale(e){return new hl(this.x*e,this.y*e)}isCollinear(e){return Math.abs(this.x*e.y-this.y*e.x)<=Math.sqrt((this.x*this.x+this.y*this.y)*(e.x*e.x+e.y*e.y))*Yt.eps}isInside(e){let t=this.x>e.minX&&this.x<e.maxX;if(!e.height())return t&&this.y===e.minY;let r=this.y>e.minY&&this.y<e.maxY;return e.width()?t&&r:r&&this.x===e.minX}*[Symbol.iterator](){yield this.x,yield this.y}get[Symbol.toStringTag](){return\"Vector2\"}}"
      },
      "pointsSet": {
        "start": 2_147_865,
        "end": 2_148_010,
        "sha256": "50254cd104fa912cb79c0e86041f99981c6c8053a9b50a6164df57e857c12db6",
        "lineNumber": 557,
        "columnNumber": 234_768
      },
      "pointsGet": {
        "start": 2_147_832,
        "end": 2_147_865,
        "sha256": "554ea2472f8d2bba679446cce1ac6c3c91c77a7a6d1fa96d5dc580690463bac9",
        "lineNumber": 557,
        "columnNumber": 234_735
      },
      "lineData": {
        "start": 2_155_076,
        "end": 2_155_361,
        "sha256": "8925258cc628592c187f1ef2d6a7390d95f4bab9768eb9c5cee540e78a50f699",
        "lineNumber": 557,
        "columnNumber": 241_979
      },
      "setLines": {
        "start": 3_971_747,
        "end": 3_972_232,
        "sha256": "3880c8aa2c2e509e73aeb464ee91aab65b14687642afe70d5065b7c6adbcd21c",
        "lineNumber": 4098,
        "columnNumber": 12_459
      },
      "sortChildren": {
        "start": 3_966_043,
        "end": 3_966_623,
        "sha256": "438d7fb428d2edcf118f9d18785c2c48ea9df5e896c6a1d0d197e9a77898b024",
        "lineNumber": 4098,
        "columnNumber": 6755
      },
      "refreshNetPoint": {
        "start": 4_150_447,
        "end": 4_151_390,
        "sha256": "02290817bc17af656c60e98b633918192d36be8e1222df0fd9d3a91c850305b5",
        "lineNumber": 4105,
        "columnNumber": 141_830
      },
      "netPointWatch": {
        "start": 4_151_582,
        "end": 4_151_848,
        "sha256": "330d8d332bb76b6e12a3a912d5b31fdbeece9e01b7eaaeef6e721b2cd967b05d",
        "lineNumber": 4105,
        "columnNumber": 142_965
      }
    }
  }
]);
