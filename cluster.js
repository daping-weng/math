function nn(x) {
    return(Math.max(x,0));
}

function identity_mat(n) {
    var result = [];
    for (var i=0;i<n;i++) {
        var row = [];
        for (var j=0;j<n;j++) {
            if (j==i) {
                row.push(1);
            } else {
                row.push(0);
            }
        }
        result.push(row);
    }
    return (result);
}

function sum_of_rows(m) {
    var result = [];
    for (var i=0;i<m.length;i++) {
        var entry = 0;
        for (var j=0;j<m.length;j++) {
            entry += m[j][i];
        }
        result.push(entry);
    }
    return (result);
}

function perm(n) {
    if (n==1) {
        return([[0]]);
    } else {
        var result = [];
        for (var i=0;i<n;i++) {
            for (var j=0;j<perm(n-1).length;j++) {
                result.push(perm(n-1)[j].slice(0,i).concat([n-1]).concat(perm(n-1)[j].slice(i,)));
            }
        }
        return (result);
    }
}

function sign(p) {
    var result = 1;
    for (var i=0;i<p.length;i++) {
        for (var j=i+1;j<p.length;j++) {
            if (p[i]>p[j]) {
                result *= (-1);
            }
        }
    }
    return(result);
}

function det(m) {
    const n = m.length;
    result = new poly([]);
    term = new poly([[1,{}]]);
    var perm_list = perm(n);
    for (var i=0;i<perm_list.length;i++) {
        term.poly = [[1,{}]];
        for (var j=0;j<n;j++) {
            term = mult(term,m[j][perm_list[i][j]]);
        }
        term = mult(term,new poly([[sign(perm_list[i]),{}]]));
        result = add(result,term);
    }
    return(result);
}

function abelianize(m) {
    for (var i=0;i<m.length;i++) {
        for (var j=0;j<m[0].length;j++) {
            m[i][j] = m[i][j].to_poly();
        }
    }
    return(m);
}

function principal_minor(m,k) {
    var sub_m = [];
    for (var i=0;i<k;i++) {
        sub_m.push(m[i].slice(0,k));
    }
    return(det(sub_m));
}

function print_mat(m) {
    var result = "\\( \\begin{pmatrix}";
    for (var j=0;j<m.length;j++) {
        result += String(m[j][0]);
        for (var i=1;i<m[0].length;i++) {
            result += "&"+String(m[j][i]);
        }
        if (j!=m.length) {
            result+="\\\\";
        }
    }
    result += "\\end{pmatrix} \\)";
    return(result);
}

class cluster {
    constructor(ex_mat,variables,frozen,c_mat = identity_mat(variables.length),g_mat = identity_mat(variables.length)) {
        this.ex_mat = ex_mat;
        this.variables = variables;
        this.frozen = frozen;
        this.c_mat = c_mat;
        this.g_mat = g_mat;
    }

    size() {
        return(this.variables.length);
    }

    c_vec_sign(k) {
        var result = 0;
        for (var j=0;j<this.size();j++) {
            result += this.c_mat[k][j];
        }
        return(Math.sign(result));
    }

    clone() {
        var cv = [];
        for (var i=0;i<this.size();i++) {
            cv.push(this.variables[i].clone());
        }
        return(new cluster(arrayClone(this.ex_mat),cv,arrayClone(this.frozen),arrayClone(this.c_mat),arrayClone(this.g_mat)));
    }

    mut(k) {
        k -= 1;
        var pos_prod = new poly([[1,{}]]);
        var neg_prod = new poly([[1,{}]]);
        for (var i=0;i<this.size();i++) {
            if (this.ex_mat[k][i] > 0) {
                for (var j=0;j<this.ex_mat[k][i];j++) {
                    pos_prod = mult(pos_prod,this.variables[i]);
                }
            } else if (this.ex_mat[k][i]<0) {
                for (var j=0;j<this.ex_mat[i][k];j++) {
                    neg_prod = mult(neg_prod,this.variables[i]);
                }
            }
        }
        this.variables[k] = divide(add(pos_prod,neg_prod),this.variables[k]);
        var c_k_sign = this.c_vec_sign(k);
        var old_ex_mat = arrayClone(this.ex_mat);
        var old_c_mat = arrayClone(this.c_mat);
        var old_g_mat = arrayClone(this.g_mat);
        for (var i=0;i<this.size();i++){
            if (i!=k) {
                for (var j=0;j<this.size();j++){
                    this.c_mat[i][j] += nn(c_k_sign*old_ex_mat[i][k])*old_c_mat[k][j];
                    if (j==k) {
                        this.ex_mat[i][j] = -old_ex_mat[i][j];
                    } else {
                        this.ex_mat[i][j] += nn(old_ex_mat[i][k])*nn(old_ex_mat[k][j])-nn(-old_ex_mat[i][k])*nn(-old_ex_mat[k][j]);
                    }
                }
            } else {
                for (var j=0;j<this.size();j++) {
                    this.c_mat[i][j] = -old_c_mat[i][j];
                    this.g_mat[i][j] = -old_g_mat[i][j];
                    for (var l=0;l<this.size();l++) {
                        this.g_mat[i][j] += nn(-c_k_sign*old_ex_mat[i][l])*old_g_mat[l][j];
                    }
                    this.ex_mat[i][j] = -old_ex_mat[i][j];
                }
            }
        }
        //console.log(this.g_mat);
    }

    mut_seq(seq) {
        //console.log(arrayClone(this.ex_mat));
        var i = 0;
        while (i<seq.length-1) {
            if (seq[i] == seq[i+1]){
                seq.splice(i,2);
                if (i>0) {
                    i -= 1;
                }
            }  else {
                i += 1;
            }
        }
        for (var j=0; j<seq.length;j++) {
            this.mut(seq[j]);
            //console.log(arrayClone(this.ex_mat));
        }
    }

    interior_vector() {
        var mat = [];
        for (var i=0; i<this.size();i++) {
            //console.log(!this.frozen.includes(i+1));
            if (!this.frozen.includes(i+1)) {
                var row = [];
                for (var j=0; j<this.size();j++) {
                    if (!this.frozen.includes(j+1)) {
                        row.push(this.g_mat[i][j]);
                    }
                }
                mat.push(row);
            }
        }
        //console.log(mat);
        return(sum_of_rows(mat));
    }
}