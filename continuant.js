function matrix_mult(a,b) {
    var output = [];
    for (var i=0; i<a.length; i++) {
        var row = [];
        for (var j=0; j<b[0].length; j++) {
            var entry = new poly([]);
            for (var k=0; k<b.length;k++) {
                entry = add(entry, mult(a[i][k], b[k][j]));
            }
            row.push(entry);
        }
        output.push(row);
    }
    return(output);
}

function present_matrix(m) {
    output = "\\begin{pmatrix} ";
    for (var i=0; i<m.length;i++) {
        for (var j=0;j<m[0].length;j++) {
            output += m[i][j].present();
            if (j<m[0].length-1) {
                output += " & ";
            }
        }
        if (i<m.length-1) {
            output += " \\\\ ";
        }
    }
    output += "\\end{pmatrix}";
    return(output);
}

class continuant {
    constructor(length, starting_index) {
        this.length = length;
        this.starting_index = starting_index;
    }

    to_poly() {
        var z = {};
        z["z_{"+String(this.starting_index)+"}"]=1;
        if (this.length < 0) {
            return(new poly([]));
        } else if (this.length==0) {
            return(new poly([[1,{}]]));
        } else if (this.length==1) {
            return(new poly([[1,z]]));
        } else {
            var a = new continuant(this.length-1,this.starting_index+1);
            var b = new continuant(this.length-2,this.starting_index+2);
            return(subtract(mult(new poly([[1,z]]), a.to_poly()), b.to_poly()));
        }
    }

    present() {
        if (this.length < 0) {
            return(new poly([]));
        } else if (this.length == 0) {
            return(new poly([[1,{}]]));
        } else if (this.length == 1) {
            var a = {};
            a["K_{"+String(this.length)+"}["+String(this.starting_index)+"]"] = 1;
            return(new poly([[1,a]]));
        } else if (this.length > 1) {
            var a = {};
            a["K_{"+String(this.length)+"}["+String(this.starting_index)+","+String(this.starting_index+this.length-1)+"]"] = 1;
            return(new poly([[1,a]]));
        }
        return(output);
    }
}

class three_braid_closure {
    constructor(blocks) {
        this.blocks = blocks;
    }

    matrix() {
        var index = 1
        for (var i=0;i<this.blocks.length;i++) {
            if (i==0) {
                var output = [[new continuant(this.blocks[0]-1,1).present(), minus(new continuant(this.blocks[0]-2,1).present()), new poly([])],[new continuant(this.blocks[0]-2,2).present(), minus(new continuant(this.blocks[0]-3,2).present()), new poly([])], [new poly([]), new poly([]), new poly([[1,{}]])]];
                index += this.blocks[0]-1;
            } else if (i%2 == 1) {
                var new_output = matrix_mult(output, [[new poly([[1,{}]]), new poly([]), new poly([])], [new poly([]), new continuant(this.blocks[i],index).present(), minus(new continuant(this.blocks[i]-1,index).present())], [new poly([]), new continuant(this.blocks[i]-1,index+1).present(), minus(new continuant(this.blocks[i]-2,index+1).present())]]);
                output = new_output;
                index += this.blocks[i];
            } else {
                var new_output = matrix_mult(output, [[new continuant(this.blocks[i],index).present(), minus(new continuant(this.blocks[i]-1,index).present()), new poly([])],[new continuant(this.blocks[i]-1,index+1).present(), minus(new continuant(this.blocks[i]-2,index+1).present()), new poly([])], [new poly([]), new poly([]), new poly([[1,{}]])]]);
                output = new_output;
                index += this.blocks[i];
            }
        }
        return(output);
    }

    equations() {
        var M = this.matrix();
        return([M[0][0], M[2][0], M[2][1]]);
    }

    homotopy() {
        var index = 1
        var a = new poly([[1,{"a":1}]]);
        var b = new poly([[1,{"b":1}]]);
        var output = [];
        for (var i=0;i<this.blocks.length-1;i++) {
            if (i==0) {
                var new_b = add(mult(new continuant(this.blocks[0]-1,1).present(),b),mult(minus(new continuant(this.blocks[0]-2,1).present()),a));
                var new_a = add(mult(new continuant(this.blocks[0]-2,2).present(),b),mult(minus(new continuant(this.blocks[0]-3,2).present()),a));
                index += this.blocks[0]-1;
                var z = {};
                z["z_{"+String(index)+"}"]=1;
                output.push([new poly([[1,z]]), add(new poly([[1,z]]), new_b)]);
                a = new_a;
                b = new poly([]);
            } else if (i%2 == 1) {
                var new_a = add(mult(new continuant(this.blocks[i],index).present(),a), mult(new continuant(this.blocks[i]-1, index).present(),b));
                var new_b = add(mult(new continuant(this.blocks[i]-1,index+1).present(),a), mult(new continuant(this.blocks[i]-2,index+1).present(),b));
                index += this.blocks[i];
                var z = {};
                z["z_{"+String(index)+"}"]=1;
                output.push([new poly([[1,z]]), add(new poly([[1,z]]), new_a)]);
                a = new poly([]);
                b = new_b;
            } else {
                var new_b = add(mult(new continuant(this.blocks[i],index).present(),b),mult(minus(new continuant(this.blocks[i]-1,index).present()),a));
                var new_a = add(mult(new continuant(this.blocks[i]-1,index+1).present(),b),mult(minus(new continuant(this.blocks[i]-2,index+1).present()),a));
                index += this.blocks[i];
                var z = {};
                z["z_{"+String(index)+"}"]=1;
                output.push([new poly([[1,z]]),add(new poly([[1,z]]), new_b)]);
                a = new_a;
                b = new poly([]);
            }
        }
    return(output);
    }
}