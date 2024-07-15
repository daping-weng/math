function non_comm_matrix_mult(a,b) {
    var result = [];
    for (var i=0;i<a.length;i++) {
        result[i] = [];
        for (var j = 0; j<b[0].length;j++) {
            var sum = new non_comm_poly([]);
            for (var k=0; k<a[0].length;k++) {
                sum = add(sum,mult(a[i][k],b[k][j]));
            }
            result[i][j] = sum;
        }
    }
    return(result);
}

function comm_matrix_mult(a,b) {
    var result = [];
    for (var i=0;i<a.length;i++) {
        result[i] = [];
        for (var j = 0; j<b[0].length;j++) {
            var sum = new poly([]);
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
                result[i].push(new non_comm_poly([[1,[],[]]]));
            } else {
                result[i].push(new non_comm_poly([]));
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
            result[i].push(new non_comm_poly([]));
        }
    }
    return(result);
}

function br(num_str,i,x) {
    var result = eye(num_str);
    result[i-1][i-1] = x;
    result[i-1][i] = new non_comm_poly([[1,[],[]]]);
    result[i][i-1] = new non_comm_poly([[1,[],[]]]);
    result[i][i] = new non_comm_poly([]);
    return(result);
}

function br_inv(num_str,i,x) {
    var result = eye(num_str);
    result[i][i] = minus(x);
    result[i-1][i] = new non_comm_poly([[1,[],[]]]);
    result[i][i-1] = new non_comm_poly([[1,[],[]]]);
    result[i-1][i-1] = new non_comm_poly([]);
    return(result);
}

function adjacent_level(n) {
    if ((n+2)%2 == 0) {
        return(n+1);
    } else {
        return(n-1);
    }
}





class plat {
    constructor(num_str,word) {
        this.num_str = num_str;
        this.word = word;
    }

    differentials() {
        var M = zeros(2*this.num_str);
        for (var i=0;i<this.num_str;i++) {
            M[2*i][2*i+1] = new non_comm_poly([[1,["t_{"+String(2*i+1)+"}"],[1]]])
        }
        var crossings = [];
        var output = [];
        for (var k=0;k<this.word.length;k++) {
            if (!(M[this.word[k]-1][this.word[k]].vanish())) {
                crossings.push(new non_comm_poly([[1,["a_{"+String(k+1)+"}"],[1]]]));
                output.push(M[this.word[k]-1][this.word[k]])
                M[this.word[k]-1][this.word[k]] = new non_comm_poly([]);
            }
            M = non_comm_matrix_mult(br_inv(this.num_str*2,this.word[k],new non_comm_poly([[1,["a_{"+String(k+1)+"}"],[1]]])),non_comm_matrix_mult(M,br(this.num_str*2,this.word[k],new non_comm_poly([[1,["a_{"+String(k+1)+"}"],[1]]]))));
        }
        for (var i=0;i<this.num_str;i++) {
            crossings.push(new non_comm_poly([[1,["b_{"+String(i+1)+"}"],[1]]]));
            output.push(subtract(M[2*i][2*i+1],new non_comm_poly([[1,["t_{"+String(2*(i+1))+"}"],[1]]])));
        }
        return([crossings,output]);
    }

    labelings_on_the_right() {
        var labelings = [];
        for (var i=0;i<this.num_str*2;i++) {
            labelings.push(i+1);
        }
        for (var k=0;k<this.word.length;k++) {
            labelings[this.word[k]-1] = labelings[this.word[k]] + labelings[this.word[k]-1];
            labelings[this.word[k]] = labelings[this.word[k]-1]-labelings[this.word[k]];
            labelings[this.word[k]-1] = labelings[this.word[k]-1]-labelings[this.word[k]];
        }
        return(labelings);
    }

    strands_at_crossings() {
        var labelings = [];
        for (var i=0;i<this.num_str*2;i++) {
            labelings.push(i+1);
        }
        var crossing_labels = [];
        for (var k=0;k<this.word.length;k++) {
            crossing_labels.push([labelings[this.word[k]-1], labelings[this.word[k]]]);
            labelings[this.word[k]-1] = labelings[this.word[k]] + labelings[this.word[k]-1];
            labelings[this.word[k]] = labelings[this.word[k]-1]-labelings[this.word[k]];
            labelings[this.word[k]-1] = labelings[this.word[k]-1]-labelings[this.word[k]];
        }
        return(crossing_labels);
    }

    link_comp() {
        var labelings = this.labelings_on_the_right();
        var components = [];
        var remaining_labels = labelings.slice();
        while (remaining_labels.length>0) {
            var level = remaining_labels[0];
            remaining_labels.splice(0,1);
            var new_comp = [level, labelings[adjacent_level(labelings.indexOf(level))]];
            remaining_labels.splice(remaining_labels.indexOf(labelings[adjacent_level(labelings.indexOf(level))]),1);
            while (adjacent_level(new_comp[new_comp.length-1]-1)+1 != new_comp[0]) {
                level = adjacent_level(new_comp[new_comp.length-1]-1)+1;
                remaining_labels.splice(remaining_labels.indexOf(level),1);
                new_comp = new_comp.concat([level, labelings[adjacent_level(labelings.indexOf(level))]]);
                remaining_labels.splice(remaining_labels.indexOf(labelings[adjacent_level(labelings.indexOf(level))]),1);
            }
            components.push(new_comp.slice());
        }
        return(components);
    }

    num_comp() {
        return(this.link_comp().length);
    }

    backward_strands(orientation) {
        var components = this.link_comp();
        var output = [];
        for (var i=0;i<components.length;i++) {
            if (orientation[i] == "+") {
                for (var j=0;j<components[i].length/2;j++) {
                    output.push(components[i][2*j+1]);
                }
            } else {
                for (var j=0;j<components[i].length/2;j++) {
                    output.push(components[i][2*j]);
                }
            }
        }
        return(output);
    }

    crossing_orientation(orientation) {
        var backward_strands = this.backward_strands(orientation);
        var strands_at_crossings = this.strands_at_crossings();
        var output = [];
        for (var k=0;k<this.word.length;k++) {
            if (backward_strands.includes(strands_at_crossings[k][0]) && backward_strands.includes(strands_at_crossings[k][1])) {
                output.push("l");
            } else if (backward_strands.includes(strands_at_crossings[k][0]) && !(backward_strands.includes(strands_at_crossings[k][1]))) {
                output.push("u");
            } else if (!(backward_strands.includes(strands_at_crossings[k][0])) && !(backward_strands.includes(strands_at_crossings[k][1]))) {
                output.push("r");
            } else {
                output.push("d");
            }
        }
        return(output);
    }

    tb(orientation) {
        var crossing_orientation = this.crossing_orientation(orientation);
        var tb = -this.num_str;
        for (var k=0;k<this.word.length;k++) {
            if (crossing_orientation[k] == "l" || crossing_orientation[k] == "r") {
                tb++;
            } else {
                tb--;
            }
        }
        return(tb);
    }

    rot(orientation) {
        var backward_strands = this.backward_strands(orientation);
        var levels = this.labelings_on_the_right();
        var rot = 0;
        for (var i=0;i<this.num_str;i++) {
            if (backward_strands.includes(2*i+1)) {
                rot --;
            } else {
                rot ++;
            }
            if (backward_strands.includes(levels[2*i])) {
                rot ++;
            } else {
                rot --;
            }
        }
        return(rot/2);
    }

    vanishing_reeb() {
        var differentials = this.differentials();
        var reeb = differentials[0];
        var diff = differentials[1];
        var a_reeb_with_diff = reeb.slice(0,reeb.length-this.num_str);
        diff = diff.slice(0,diff.length-this.num_str);
        var vanishing_a_reeb = [];
        for (var i=0;i<diff.length;i++) {
            for (var j=0;j<this.num_str;j++) {
                diff[i].subs([["t_{"+String(2*j+1)+"}",new non_comm_poly([[1,[],[]]])]]);
            }
        }
        if (diff.length>0){
            var same = false;
            while (!same && diff.length>0) {
                for (var i=0;i<diff.length;i++) {
                    if (diff[i].poly.length == 1 && diff[i].poly[0][1].length == 1 && diff[i].poly[0][1][0].startsWith("a_")) {
                        vanishing_a_reeb.push(new non_comm_poly([[1,[diff[i].poly[0][1][0]],[1]]]));
                        vanishing_a_reeb.push(a_reeb_with_diff[i]);
                        var j = 0;
                        while (j<diff.length) {
                            diff[j].kill(vanishing_a_reeb[vanishing_a_reeb.length-1]);
                            diff[j].kill(vanishing_a_reeb[vanishing_a_reeb.length-2]);
                            if (diff[j].poly.length == 0) {
                                diff.splice(j,1);
                                a_reeb_with_diff.splice(j,1);
                                j--;
                            }
                            j++;
                        }
                        break;
                    }
                    if (i == diff.length-1) {
                        same = true;
                    }   
                }
            }
        }
        vanishing_a_reeb.sort((a,b) => a.index()-b.index());
        return([vanishing_a_reeb,a_reeb_with_diff]);
    }

    aug_eqns() {
        var differentials = this.differentials()[1];
        var vanishing = this.vanishing_reeb();
        var van = vanishing[0];
        var a_reeb_with_diff = vanishing[1];
        for (var k=0;k<differentials.length;k++) {
            for (var j=0;j<van.length;j++) {
                differentials[k].kill(van[j]);
            }
        }
        var i =0;
        while (i<differentials.length) {
            if (differentials[i].vanish()) {
                differentials.splice(i,1);
                i--;
            }
            i++;
        }
        var blist = [];
        for (var j=0;j<this.num_str;j++) {
            blist.push(new non_comm_poly([[1,["b_{"+String(j+1)+"}"],[1]]]));
        }
        return([differentials, a_reeb_with_diff.concat(blist), van])
    }

    invertible_generators() {
        var eqns = this.aug_eqns()[0];
        var output = [];
        for (var i=0;i<eqns.length;i++) {
            for (var j=0;j<this.num_str*2;j++) {
                eqns[i].subs([["t_{"+String(j+1)+"}", new non_comm_poly([[1,[],[]]])]]);
            }
        }
        for (var k=0;k<this.word.length;k++) {
            for (var i=0;i<eqns.length;i++) {
                var new_eqn = eqns[i].clone();
                new_eqn.subs([["a_{"+String(k+1)+"}", new non_comm_poly([])]]);
                if (add(new_eqn,new non_comm_poly([[1,[],[]]])).vanish() || subtract(new_eqn,new non_comm_poly([[1,[],[]]])).vanish()) {
                    output.push(new non_comm_poly([[1,["a_{"+String(k+1)+"}"],[1]]]));
                    for (var j=0;j<eqns.length;j++) {
                       eqns[j].subs([["a_{"+String(k+1)+"}", new non_comm_poly([[1,[],[]]])]]);
                    }
                    break;
                }
            }
        }
        var tlist = [];
        for (var j=0;j<this.num_str*2;j++) {
            tlist.push(new non_comm_poly([[1,["t_{"+String(j+1)+"}"],[1]]]));
        }
        return(output.concat(tlist));
    }
}