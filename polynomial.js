function comparator(a, b) {
    if (a[1] < b[1]) {
        return -1;
    }
    if (a[1] > b[1]) {
        return 1;
    }
    if (a[1] == b[1]) {
        if (String(a[2]) < String(b[2])) {
            return -1;
        }
        if (String(a[2]) > String(b[2])) {
            return 1;
        }
        if (String(a[2]) == String(b[2])) {
            return 0;
        }
    }
}

function arrayClone( arr ) {
    var i, copy;
    if( Array.isArray( arr ) ) {
        copy = arr.slice( 0 );
        for( i = 0; i < copy.length; i++ ) {
            copy[ i ] = arrayClone( copy[ i ] );
        }
        return copy;
    } else if( typeof arr === 'object' ) {
        throw 'Cannot clone array containing an object!';
    } else {
        return arr;
    }
}

function list_mult(a,b) {    
    var h = [];
    for (var i=0;i<a.length;i++) {
        for (var j=0;j<b.length;j++) {
            h.push([a[i][0]*b[j][0],a[i][1].concat(b[j][1]),a[i][2].concat(b[j][2])]);
        }
    }
    return(h);
}



function object_mult(a,b) {
    var h = [];
    for (var i=0;i<a.length;i++) {
        for (var j=0;j<b.length;j++) {
            var c = Object.assign({},a[i][1]);
            var d = Object.assign({},b[j][1]);
            for (x in c) {
                if (d.hasOwnProperty(x)) {
                    c[x] += d[x];
                    delete d[x];
                }
            }
            h.push([a[i][0]*b[j][0],Object.assign({},c,d)]);
        }
    }
    return(h);
}

function object_comparison(x,y) {
    if (Object.keys(x).length != Object.keys(y).length) {
        return Boolean(false);
    } else {
        for (var x_key in x) {
            if (y.hasOwnProperty(x_key)) {
                if (y[x_key] != x[x_key]) {
                    return Boolean(false);
                }
            } else {
                return Boolean(false);
            }
        }
        return Boolean(true);
    }
  }




class poly {
    constructor(f) {
        this.poly = f;
    }

    length() {
        return this.poly.length;
    }
                
    clone() {
        var f = [];
        for (var i=0;i<this.length();i++) {
            f.push([this.poly[i][0],Object.assign({},this.poly[i][1])]);
        }
        return(new poly(f));
    }

    

    present() {
        if (this.length() == 0) {
            return "0";
        } else {
            var to_print = "";
            var new_term = "";
            for (var j=0;j<this.length();j++) {
                for (var x in this.poly[j][1]) {
                    new_term += x;
                    if (this.poly[j][1][x] != 1) {
                        new_term += "^{" + String(this.poly[j][1][x]) + "}";
                    }
                }
                if (Object.keys(this.poly[j][1]).length == 0 && this.poly[j][0]>=0) {
                    new_term = "+" +String(this.poly[j][0]);
                } else if (Object.keys(this.poly[j][1]).length == 0 && this.poly[j][0]<0) {
                    new_term = String(this.poly[j][0]);
                } else if (this.poly[j][0]==1) {
                    new_term = "+" + new_term;
                } else if (this.poly[j][0] >= 0) {
                    new_term = "+" + String(this.poly[j][0]) + new_term;
                } else if (this.poly[j][0] == -1) {
                    new_term = "-" + new_term;
                } else if (this.poly[j][0] < 0) {
                    new_term = String(this.poly[j][0]) + new_term;
                }
                to_print += new_term;
                new_term = "";
            }
            if (this.poly[0][0] >= 0) {
                return to_print.slice(1,);
            } else {
                return to_print;
            }
        }
    }

    simplify() {
        for (var i=0;i<this.length();i++) {
            for (var x in this.poly[i][1]) {
                if (this.poly[i][1][x] == 0) {
                    delete this.poly[i][1][x];
                }
            }
        }
        for (var i=0;i<this.length();i++) {
            var j = i+1;
            while (j<this.length()) {
                if (object_comparison(this.poly[i][1],this.poly[j][1])) {
                    this.poly[i][0] += this.poly[j][0];
                    this.poly.splice(j,1);
                } else {
                    j += 1;
                }
            }
        }
        for (var i=0;i<this.length();i++) {
            if (this.poly[i][0]==0) {
                this.poly.splice(i,1);
                i-=1;
            }
        }
    }

    sort_terms(a_var) {
        this.poly.sort(function(b,c){
            for (var x of a_var) {
                if (b[1].hasOwnProperty(x) && c[1].hasOwnProperty(x)) {
                    if (b[1][x]!=c[1][x]) {
                        return(c[1][x]-b[1][x])
                    }
                } else if (b[1].hasOwnProperty(x)) {
                    return(-b[1][x]);
                } else if (c[1].hasOwnProperty(x)) {
                    return(c[1][x]);
                }
            }
            return(0);
        });
    }

    subs(to_sub) {
        if (to_sub.length == 1) {
            var after_sub = [];
            for (var j=0;j<this.length();j++) {
                var term = [[this.poly[j][0],Object.assign({},this.poly[j][1])]];
                if (term[0][1].hasOwnProperty(to_sub[0][0])) {
                    delete term[0][1][to_sub[0][0]];
                    for (var m=0;m<this.poly[j][1][to_sub[0][0]];m++) {
                        term = object_mult(term,to_sub[0][1].poly);
                    } 
                }
                after_sub = after_sub.concat(term);
            }
            this.poly = after_sub;
        } else {
            for (var i=0;i<to_sub.length;i++) {
                this.subs([to_sub[i]]);
            }
        }
        this.simplify();
    }
}

class non_comm_poly {
    constructor(f) {
        this.poly = f;
    }

    length() {
        return this.poly.length;
    }

    clone() {
        return(new non_comm_poly(arrayClone(this.poly)));
    }

    present() {
        if (this.length() == 0) {
            return "0";
        } else {
            var to_print = "";
            var new_term = "";
            for (var j=0;j<this.length();j++) {  
                for (var i=0;i<this.poly[j][1].length;i++) {
                    new_term += this.poly[j][1][i]; 
                    if (this.poly[j][2][i] != 1) {
                        new_term += "^{" + String(this.poly[j][2][i]) + "}";
                    }
                }
                if (this.poly[j][1].length==0 && this.poly[j][0]>=0) {
                    new_term = "+"+String(this.poly[j][0]);
                } else if (this.poly[j][1].length==0 && this.poly[j][0]<0){
                    new_term =String(this.poly[j][0]);
                } else if (this.poly[j][0] == 1) {
                    new_term = "+" + new_term;
                } else if (this.poly[j][0] >= 0) {
                    new_term = "+" + String(this.poly[j][0]) + new_term;
                } else if (this.poly[j][0] == -1) {
                    new_term = "-" + new_term;
                } else if (this.poly[j][0] < 0) {
                    new_term = String(this.poly[j][0]) + new_term;
                }
                to_print += new_term;
                new_term = "";
            }
            if (this.poly[0][0] >= 0) {
                return to_print.slice(1,);
            } else {
                return to_print;
            }
        }           
    }

    simplify() {
        for (var i=0;i<this.length();i++) {
            var j = 0;
            while (j<this.poly[i][1].length) {
                if (j<this.poly[i][1].length-1) {
                    if (this.poly[i][1][j] == this.poly[i][1][j+1]) {
                        this.poly[i][2][j] += this.poly[i][2][j+1];
                        this.poly[i][1].splice(j+1,1);
                        this.poly[i][2].splice(j+1,1);
                    } else if (this.poly[i][2][j] == 0) {
                        this.poly[i][1].splice(j,1);
                        this.poly[i][2].splice(j,1);
                        if (j>0) {
                            j -= 1;
                        }
                    } else {
                        j += 1;
                    }
                } else if (this.poly[i][2][j] == 0) {
                    this.poly[i][1].splice(j,1);
                    this.poly[i][2].splice(j,1);
                } else {
                    j += 1;
                }
            }
        }
        this.poly.sort(comparator);
        var i = 0;
        while (i<this.length()) {
            if (i<this.length()-1) {
                if (String(this.poly[i][1]) == String(this.poly[i+1][1]) && String(this.poly[i][2]) == String(this.poly[i+1][2])) {
                    this.poly[i][0] += this.poly[i+1][0];
                    this.poly.splice(i+1,1);
                } else if (this.poly[i][0] == 0) {
                    this.poly.splice(i,1);
                } else {
                    i += 1;
                }
            } else if (this.poly[i][0] == 0) {
                this.poly.splice(i,1);
            } else {
                i += 1;
            }
        }
    }

    subs(to_sub) {
        if (to_sub.length == 1) {
            var after_sub = [];
            for (var j=0;j<this.length();j++) {
                var pos = [];
                var k = -1;
                while ((k = this.poly[j][1].indexOf(to_sub[0][0], k+1)) != -1) {
                    pos.push(k);
                }
                if (pos.length > 0) {
                    var term = [[this.poly[j][0],this.poly[j][1].slice(0,pos[0]),this.poly[j][2].slice(0,pos[0])]];
                    for (var l=0;l<pos.length;l++) {
                        for (var m=0;m<this.poly[j][2][pos[l]];m++){
                            term = list_mult(term, to_sub[0][1].poly);
                        }
                        if (l<pos.length-1) {
                            term = list_mult(term, [[1,this.poly[j][1].slice(pos[l]+1,pos[l+1]),this.poly[j][2].slice(pos[l]+1,pos[l+1])]]);
                        } else if (pos[l]<this.poly[j][1].length-1) {
                            term = list_mult(term, [[1,this.poly[j][1].slice(pos[l]+1,),this.poly[j][2].slice(pos[l]+1,)]]);
                        }
                    }
                } else {
                    term = [[this.poly[j][0],this.poly[j][1].slice(0,),this.poly[j][2].slice(0,)]];
                }
                after_sub = after_sub.concat(term);
            }
            this.poly = after_sub;
        } else {
            for (var i=0;i<to_sub.length;i++) {
                this.subs([to_sub[i]]);
            }
        }
        this.simplify();
    }

    to_poly() {
        var h = [];
        for (var i=0;i<this.length();i++) {
            var c = {};
            for (var j=0;j<this.poly[i][1].length;j++) {
                if (c.hasOwnProperty(this.poly[i][1][j])) {
                    c[this.poly[i][1][j]] += this.poly[i][2][j];
                } else {
                    c[this.poly[i][1][j]] = this.poly[i][2][j]; 
                }
            }
            h.push([this.poly[i][0],Object.assign({},c)]);
        }
        return(new poly(h));
    }

    vanish() {
        this.simplify();
        if (this.poly.length == 0) {
            return(true);
        } else {
            return(false);
        }
    }

    index() {
        var s = this.poly[0][1][0];
        s=s.replace(/[^0-9]/g, '');
        return(parseInt(s));
    }

    mono_inv() {
        var f = [0,[],[]];
        if (this.length()==1) {
            for (var i=0;i<this.poly[0][2].length;i++) {
                f[1].push(this.poly[0][1][i]);
                f[2].push(-this.poly[0][2][i]);
            }
            f[0] = 1/this.poly[0][0];
            f[1].reverse();
            f[2].reverse();
            return(new non_comm_poly([f]));
        } else {
            console.log("cannot invert a non-monomial.");
            return(null);
        }
    }

    kill(g) {
        this.subs([[g.poly[0][1][0], new non_comm_poly([])]]);
    }
}

function add(a,b) {
    if (a instanceof poly) {
        c = new poly(a.poly.concat(b.poly));
    } else {
        c = new non_comm_poly(a.poly.concat(b.poly));
    }
    c.simplify();
    return(c);
}

function minus(a) {
    b = a.clone();
    for (var i=0;i<b.length();i++) {
        b.poly[i][0] = -b.poly[i][0];
    }
    return(b);
}

function subtract(a,b) {
    return(add(a.clone(),minus(b)));
}

function mult(a,b) {
    if (a instanceof poly) {
        c = new poly(object_mult(a.poly,b.poly));
    } else {
        c = new non_comm_poly(list_mult(a.poly,b.poly));
    }
    c.simplify();
    return(c);
}

//The function below can only be used to divide two polynomials with positive coefficients.
//One polynomial has to be divisible by the other.

function pos_divide(a,b) {
    if (b.length == 0) {
        console.log("cannot divide by 0");
        return(null);
    } else if (b.length() == 1) {
        c = b.clone();
        c.poly[0][0] = 1/(c.poly[0][0]);
        for (x in c.poly[0][1]) {
            c.poly[0][1][x] = -c.poly[0][1][x];
        }
        d = new poly(object_mult(a.poly,c.poly));
        d.simplify();
        return(d);
    } else {
        r = a.clone();
        t = new poly([[b.poly[0][0],Object.assign({},b.poly[0][1])]]);
        q = new poly([]);
        var j = 1;
        while (r.length()>0) {
            for (var i = 0; i<r.length();i++) {
                k = new poly([[r.poly[i][0],Object.assign({},r.poly[i][1])]]);
                p = divide(k,t);
                e = subtract(r,mult(p,b));
                if (e.length()<r.length()) {
                    r = e.clone();
                    q = add(q,p);
                    break;
                }
            }
            j-=1;
        }
        q.simplify();
        return(q);
    }
}

function divide(a,b) {
    if (b.length == 0) {
        console.log("cannot divide by 0");
        return(null);
    } else {
        var a_var = [];
        var b_var = [];
        for (var i=0;i<a.poly.length;i++) {
            for (x in a.poly[i][1]) {
                if (!a_var.includes(x)) {
                    a_var.push(x);
                }
            }
        }
        for (var i=0;i<b.poly.length;i++) {
            for (x in b.poly[i][1]) {
                if (!b_var.includes(x)) {
                    b_var.push(x);
                }
            }
        }
        if (!b_var.every(val => a_var.includes(val))) {
            console.log("there is a variable present in the divisor but not in the divided.")
            return(null);
        } else {
            a.sort_terms(a_var);
            b.sort_terms(a_var);
            //console.log(a_var);
            //console.log(a);
            //console.log(b);
            var leading_term_var = {};
            for (x in b.poly[0][1]) {
                leading_term_var[x] = -b.poly[0][1][x];
            }
            leading_term = new poly ([[1/b.poly[0][0],leading_term_var]]);
            //console.log(leading_term);
            quotient = new poly([]);
            f = a.clone();
            //console.log("f=",f);
            //var  k = 0;
            while (f.poly.length>0) {
                new_q_term = mult(leading_term,new poly([f.poly[0]]));
                //console.log(new_q_term);
                //console.log(f);
                //console.log("c=",mult(b,new_q_term));
                f = subtract(f,mult(b,new_q_term));
                f.sort_terms(a_var);
                quotient = add(quotient, new_q_term);
                //k += 1;
                //console.log("f=",f);
            }
            return (quotient);
        }
    }
}

