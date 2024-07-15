function matrix_mult(a,b) {
    var result = [];
    for (var i=0;i<a.length;i++) {
        result[i] = [];
        for (var j = 0; j<b[0].length;j++) {
            var sum = new fraction(new poly([]),new poly([[1,{}]]));
            for (var k=0; k<a[0].length;k++) {
                sum = add(sum,mult(a[i][k],b[k][j]));
            }
            result[i][j] = sum;
        }
    }
    return(result);
}

function eye(n) {
    var result = [];
    for (var i=0;i<n;i++) {
        result.push([]);
        for (var j=0;j<n;j++) {
            if (j==i) {
                result[i].push(new fraction(new poly([[1,{}]]), new poly([[1,{}]])));
            } else {
                result[i].push(new fraction(new poly([]), new poly([[1,{}]])));
            }
        }
    }
    return(result);
}

function zeros(n) {
    var result = [];
    for (var i=0;i<n;i++) {
        result.push([]);
        for (var j=0;j<n;j++) {
            result[i].push(new fraction(new poly([])), new poly([[1,{}]]));
        }
    }
    return(result);
}

function new_br(num_str,i,x, y) {
    var result = eye(num_str);
    result[i-1][i-1] = mult(x,y);
    result[i-1][i] = minus(y.invert());
    result[i][i-1] = y.clone();
    result[i][i] = new fraction(new poly([]), new poly([[1,{}]]));
    return(result);
}

function new_br_inv(num_str,i,x ,y) {
    var result = eye(num_str);
    result[i][i] = mult(x,y);
    result[i-1][i] = minus(y.invert());
    result[i][i-1] = y.clone();
    result[i-1][i-1] = new fraction(new poly([]), new poly([[1,{}]]));
    return(result);
}


function br(num_str,i,x) {
    var result = eye(num_str);
    result[i-1][i-1] = x;
    result[i-1][i] = new fraction(new poly([[-1,{}]]), new poly([[1,{}]]));
    result[i][i-1] = new fraction(new poly([[1,{}]]), new poly([[1,{}]]));
    result[i][i] = new fraction(new poly([]), new poly([[1,{}]]));
    return(result);
}



function br_inv(num_str,i,x) {
    var result = eye(num_str);
    result[i][i] = x;
    result[i-1][i] = new fraction(new poly([[1,{}]]), new poly([[1,{}]]));
    result[i][i-1] = new fraction(new poly([[-1,{}]]), new poly([[1,{}]]));
    result[i-1][i-1] = new fraction(new poly([]), new poly([[1,{}]]));
    return(result);
}

function diag(num_str,i,x){
    var result = eye(num_str);
    result[i-1][i-1] = x;
    result[i][i] = x.invert();
    return(result);
}

function det(M) {//3x3 determinant
    return(M[0][0]*M[1][1]*M[2][2]+M[0][1]*M[1][2]*M[2][0]+M[0][2]*M[1][0]*M[2][1]-M[0][0]*M[1][2]*M[2][1]-M[0][1]*M[1][0]*M[2][2]-M[0][2]*M[1][1]*M[2][0]);
}


class braid {
    constructor(num_str, word) {
        this.num_str = num_str;
        this.word = word;
    }
    

    clone() {    
        return (new braid(this.num_str,arrayClone(this.word)));
    }

    pinch(i) {
        if (this.word[i] == this.word[i+1]) {
            this.word.splice(i+1,1);
            return(true);
        } else {
            console.log("not pinchable");
            return(false);
        }
    }

    braid_move(i) {
        if (this.word[i-1]==this.word[i+1] && Math.abs(this.word[i]-this.word[i-1])==1) {
            this.word[i-1] = this.word[i];
            this.word[i] = this.word[i+1];
            this.word[i+1] = this.word[i-1];
            return(true);
        } else {
            console.log("braid move cannot be performed.");
            return(false);
        }
    }

    commute(i) {
        if (Math.abs(this.word[i]-this.word[i+1])>1) {
            this.word[i] = this.word[i]+this.word[i+1];
            this.word[i+1] = this.word[i]-this.word[i+1];
            this.word[i] = this.word[i]-this.word[i+1];
            return(true);
        } else {
            console.log("cannot exchange the two strands.");
            return(false);
        }
    }

    cycles_and_quiver(moves) {
        var cycles = [];
        var ex_mat = [];
        var vertex_position = [];
        var frozen = [];
        for (var k=0;k<moves.length;k++) {
            if (moves[k][0] == "p") {
                var index = moves[k][1];
                var new_level = [];
                if (cycles.length>0) {
                    for (var i=0;i<cycles[cycles.length-1].length;i++) {
                        var c = cycles[cycles.length-1][i].slice();
                        c[index] = Math.min(c[index],c[index+1]);
                        c.splice(index+1,1);
                        new_level.push(c.slice());
                    }
                }
                var new_cycle = [];
                //console.log("the word is");
                //console.log(word);
                for (var i=0;i<this.word.length-1;i++) {
                    new_cycle.push(0);
                }
                new_cycle[index] = 1;
                //console.log("the new cycle is");
                //console.log(new_cycle);
                new_level.push(new_cycle.slice());
                ex_mat.push([]);
                if (cycles.length>0) {
                    for (var i=0;i<cycles[cycles.length-1].length;i++) {
                        for (var j=i+1;j<cycles[cycles.length-1].length;j++) {
                            ex_mat[i][j] += det([[1,1,1],[cycles[cycles.length-1][i][index+1],cycles[cycles.length-1][i][index],new_level[i][index]],[cycles[cycles.length-1][j][index+1],cycles[cycles.length-1][j][index],new_level[j][index]]]);
                            if (ex_mat[i][j] !=0 ) {
                                ex_mat[j][i] = -ex_mat[i][j];
                            } else {
                                ex_mat[j][i] = 0;
                            }
                        }
                        ex_mat[i].push(det([[1,1,1],[cycles[cycles.length-1][i][index+1],cycles[cycles.length-1][i][index],new_level[i][index]],[0,0,1]]));
                        ex_mat[ex_mat.length-1].push(-ex_mat[i][ex_mat[i].length-1]);
                    }
                }
                ex_mat[ex_mat.length-1].push(0);
                cycles.push(new_level.slice());
                vertex_position.push([index+1,cycles.length]);
                this.word.splice(index+1,1);
            } else if (moves[k][0] == "b") {
                var index = moves[k][1];
                var new_level = [];
                if (cycles.length>0) {
                    for (var i=0;i<cycles[cycles.length-1].length;i++) {
                        var c = cycles[cycles.length-1][i].slice();
                        c[index] = Math.min(cycles[cycles.length-1][i][index-1],cycles[cycles.length-1][i][index+1]);
                        c[index-1] = cycles[cycles.length-1][i][index+1]+cycles[cycles.length-1][i][index]-c[index];
                        c[index+1] = cycles[cycles.length-1][i][index-1]+cycles[cycles.length-1][i][index]-c[index];
                        new_level.push(c);
                    }
                    for (var i=0;i<cycles[cycles.length-1].length;i++) {
                        for (var j=i+1;j<cycles[cycles.length-1].length;j++) {
                            ex_mat[i][j] += (det([[1,1,1],[cycles[cycles.length-1][i][index+1],cycles[cycles.length-1][i][index-1],new_level[i][index]],[cycles[cycles.length-1][j][index+1],cycles[cycles.length-1][j][index-1],new_level[j][index]]])+det([[1,1,1],[cycles[cycles.length-1][i][index],new_level[i][index-1],new_level[i][index+1]],[cycles[cycles.length-1][j][index],new_level[j][index-1],new_level[j][index+1]]]))/2;
                            if (ex_mat[i][j] != 0) {
                                ex_mat[j][i] = -ex_mat[i][j];
                            } else {
                                ex_mat[j][i] = 0;
                            }
                        }
                    }
                    cycles.push(new_level);
                }
                this.word[index-1] = this.word[index];
                this.word[index] = this.word[index+1];
                this.word[index+1] = this.word[index-1];
            } else if (moves[k][0] == "c") {
                var index = moves[k][1];
                var new_level = [];
                if (cycles.length>0) {
                    for (var i=0;i<cycles[cycles.length-1].length;i++) {
                        var c = cycles[cycles.length-1][i].slice();
                        c[index] = c[index+1]+c[index];
                        c[index+1] = c[index] - c[index+1];
                        c[index] = c[index] - c[index+1];
                        new_level.push(c);
                    }
                    cycles.push(new_level);
                }
                this.word[index] = this.word[index] + this.word[index+1];
                this.word[index+1] = this.word[index]-this.word[index+1];
                this.word[index]  = this.word[index]-this.word[index+1]; 
            }
        }
        if (cycles.length>0) {
            for (var i=0;i<cycles[cycles.length-1].length;i++) {
                for (var j=0;j<cycles[cycles.length-1][i].length;j++) {
                    if (cycles[cycles.length-1][i][j] > 0) {
                        frozen.push(i);
                        break;
                    }
                }
            }
        }   
        return([cycles,ex_mat,vertex_position,frozen]);
    }


    cluster_variables(moves) {
        var Z = [];
        var no_pinch_yet = true;
        variables = [];
        original_braid = this.clone();
        var cycles = original_braid.cycles_and_quiver(moves)[0];
        //console.log(cycles);
        for (var i=0;i<this.word.length;i++) {
            var z = {};
            z["z_{"+String(i+1)+"}"] = 1;
            Z.push(new fraction(new poly([[1,z]]), new poly([[1,{}]])));
        }
        for (var l=0;l<moves.length;l++) {
            var oldT = [];
            for (var k=0;k<this.word.length;k++) {
                oldT.push(new fraction(new poly([[1,{}]]), new poly([[1,{}]])));
            }
            if (!no_pinch_yet) {
                //console.log("cycles are");
                //console.log(cycles[l-first_pinch-1]);
                //console.log("variables are");
                //console.log(variables);
                for (var k=0;k<cycles[l-first_pinch-1].length;k++) {
                    for (var n=0;n<cycles[l-first_pinch-1][k].length;n++) {
                        for (var m=0;m<cycles[l-first_pinch-1][k][n];m++) {
                            oldT[n] = mult(oldT[n],new fraction(variables[k],new poly([[1,{}]])));
                        }
                    }
                }
            }
            if (moves[l][0] == "p") {
                if (no_pinch_yet) {
                    var first_pinch = l;
                    no_pinch_yet = false;
                }
                var index = moves[l][1];
                Z[index] = subtract(Z[index],mult(mult(oldT[index].invert(),oldT[index].invert()),Z[index+1].invert()));
                var Tindex = mult(mult(oldT[index],Z[index+1]),oldT[index+1]);
                var new_variable = divide(Tindex.num, Tindex.den);
                var M = eye(this.num_str);
                M[this.word[index]-1][this.word[index]] = minus(mult(mult(oldT[index+1].invert(),oldT[index+1].invert()),Z[index+1].invert()));
                for (var k=index+2;k<this.word.length;k++) {
                    var a = Z[k].clone();
                    Z[k] = add(Z[k],M[this.word[k]-1][this.word[k]]);
                    M = matrix_mult(matrix_mult(br_inv(this.num_str,this.word[k],Z[k]),M),br(this.num_str,this.word[k],a));
                    M = matrix_mult(matrix_mult(diag(this.num_str,this.word[k],oldT[k].invert()),M),diag(this.num_str,this.word[k],oldT[k]));
                }
                this.word.splice(index+1,1)
                Z.splice(index+1,1);
                //console.log(new_variable);
                //console.log(cycles[l-first_pinch]);
                //console.log(variables);
                for (var n=0;n<cycles[l-first_pinch].length-1;n++) {
                    for (var m=0;m<cycles[l-first_pinch][n][index];m++) {
                        new_variable = divide(new_variable,variables[n]);
                    }
                }
                variables.push(new_variable);
            } else if (moves[l][0] == "b") {
                var newT = [];
                for (var k=0;k<this.word.length;k++) {
                    newT.push(new fraction(new poly([[1,{}]]), new poly([[1,{}]])));
                }
                if (!no_pinch_yet) {
                    for (var k=0;k<cycles[l-first_pinch].length;k++) {
                        for (var n=0;n<cycles[l-first_pinch][k].length;n++) {
                            for (var m=0;m<cycles[l-first_pinch][k][n];m++) {
                                newT[n] = mult(newT[n],new fraction(variables[k],new poly([[1,{}]])));
                            }
                        }
                    }
                }
                var i = moves[l][1];
                var z1 = Z[i-1].clone();
                var z2 = Z[i].clone();
                var z3 = Z[i+1].clone();
                Z[i-1] = mult(mult(oldT[i-1],z3),oldT[i].invert());
                Z[i] = subtract(mult(mult(z1,z3), mult(mult(oldT[i-1],oldT[i+1]),newT[i].invert())),mult(mult(z2,newT[i-1]),oldT[i-1].invert()));
                Z[i+1] = mult(mult(z1,newT[i]),newT[i-1].invert());
                this.word[i-1] = this.word[i];
                this.word[i] = this.word[i+1];
                this.word[i+1] = this.word[i-1];
            } else if (moves[l][0] == "c") {
                var index = moves[l][1];
                var c  = Z[index];
                Z[index] = Z[index+1];
                Z[index+1] = c;
                this.word[index] = this.word[index] + this.word[index+1];
                this.word[index+1] = this.word[index]-this.word[index+1];
                this.word[index]  = this.word[index]-this.word[index+1]; 
            }
        }
        return(variables);
    }

}








