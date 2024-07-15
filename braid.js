function cyclic_switch(a,arr) {
    if (arr.includes(a)) {
        if (arr.indexOf(a)<arr.length-1){
            return (arr[arr.indexOf(a)+1]);
        } else {
            return (arr[0]);
        }
    } else {
        return(a);
    }
}

function binary(m,l) {
    var result = [];
    while (l!=0) {
        var a = Math.floor(m/Math.pow(2,l-1));
        m -= a*Math.pow(2,l-1);
        l -= 1;
        result.push(a);
    }
    return(result);
}

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

function mk_pt(num_str,pair,x){
    var result = eye(num_str);
    result[pair[0]-1][pair[0]-1] = new non_comm_poly([[1,[x],[1]]]);
    result[pair[1]-1][pair[1]-1] = new non_comm_poly([[-1,[x],[-1]]]);
    return(result);
}

function mk_pt_inv(num_str,pair,x){
    var result = eye(num_str);
    result[pair[0]-1][pair[0]-1] = new non_comm_poly([[1,[x],[-1]]]);
    result[pair[1]-1][pair[1]-1] = new non_comm_poly([[-1,[x],[1]]]);
    return(result);
}

function lower_truncate(m) {
    for (var i=0;i<m.length;i++) {
        for (var j=0;j<i+1;j++) {
            m[i][j] = new non_comm_poly([]);
        }
    }
    return(m);
}

function upper_truncate(m) {
    for (var i=0;i<m.length;i++) {
        for (var j=i;j<m.length;j++) {
            m[i][j] = new non_comm_poly([]);
        }
    }
    return(m);
}



class braid {
    constructor(num_str,word,reeb_label,mk_pt_label) {
        this.num_str = num_str;
        this.word = word;
        this.reeb_label = reeb_label;
        this.mk_pt_label = mk_pt_label;
    }

    clone() {
        return (new braid(this.num_str,arrayClone(this.word),arrayClone(this.reeb_label),arrayClone(this.mk_pt_label)));
    }

    length() {
        return(this.word.length);
    }

    trans_mat() {
        var result = [];
        for (var k=0;k<this.length();k++) {
            if (Number.isInteger(this.word[k])) {
                result.push(br(this.num_str,this.word[k],new non_comm_poly([[1,["b_{"+this.reeb_label[k]+"}"],[1]]])));
            } else {
                result.push(mk_pt(this.num_str,this.word[k],"p_{"+this.reeb_label[k]+"}"));
            }
        }
        return(result);
    }

    differentials() {
        var mat = eye(this.num_str);
        var result = []
        for (var m of this.trans_mat()) {
            mat = non_comm_matrix_mult(mat,m);
        }
        for (var k=0;k<this.num_str;k++) {
            console.log(mat[k][k].present());
            result.push(add(mat[k][k],new non_comm_poly([[1,["t_{"+String(k+1)+"}"],[-1]]])));
            var diff = zeros(this.num_str);
            for (var i=k+1;i<this.num_str;i++) {
                for (var j=k+1;j<this.num_str;j++) {
                    diff[i][j] = add(mat[i][j],mult(mult(mat[i][k], new non_comm_poly([[1,["t_{"+String(k+1)+"}"],[1]]])), mat[k][j]));
                }
            }
            for (var i=k+1;i<this.num_str;i++) {
                for (var j=k+1;j<this.num_str;j++) {
                    mat[i][j] = diff[i][j];
                }
            }
        }
        return(result);
    }


    pinch(k){
        var left_word = this.word.slice(0,k);
        var right_word = this.word.slice(k+1,);
        left_word.reverse();
        var assignment = [];
        var left_scan_mat = zeros(this.num_str);
        left_scan_mat[this.word[k]][this.word[k]-1]= new non_comm_poly([[1,["p_{"+String(this.reeb_label[k])+"}"],[-1]]]);
        for (var j=0;j<left_word.length;j++) {
            if (Number.isInteger(left_word[j])) {
                assignment.push(subtract(new non_comm_poly([[1,["b_{"+String(this.reeb_label[k-j-1])+"}"],[1]]]),left_scan_mat[left_word[j]][left_word[j]-1]));
                left_scan_mat = non_comm_matrix_mult(non_comm_matrix_mult(br(this.num_str,left_word[j],new non_comm_poly([[1,["b_{"+String(this.reeb_label[k-j-1])+"}"],[1]]])), left_scan_mat),br_inv(this.num_str,left_word[j],assignment[assignment.length-1]));
                left_scan_mat = upper_truncate(left_scan_mat);
            } else {
                assignment.push(new non_comm_poly([[1,["p_{"+String(this.reeb_label[k-j-1])+"}"],[1]]]));
                left_scan_mat = non_comm_matrix_mult(non_comm_matrix_mult(mk_pt(this.num_str,left_word[j],"p_{"+String(this.reeb_label[k-j-1])+"}"),left_scan_mat),mk_pt_inv(this.num_str,left_word[j],"p_{"+String(this.reeb_label[k-j-1])+"}"));
            }
        }
        assignment.reverse();
        assignment.push(new non_comm_poly([[1,["p_{"+String(this.reeb_label[k])+"}"],[1]]]));
        var right_scan_mat = zeros(this.num_str);
        right_scan_mat[this.word[k]-1][this.word[k]] = new non_comm_poly([[-1,["p_{"+String(this.reeb_label[k])+"}"],[-1]]]);
        for (var j=0;j<right_word.length;j++) {
            if (Number.isInteger(right_word[j])) {
                assignment.push(add(new non_comm_poly([[1,["b_{"+String(this.reeb_label[k+j+1])+"}"],[1]]]),right_scan_mat[right_word[j]-1][right_word[j]]));
                right_scan_mat = non_comm_matrix_mult(non_comm_matrix_mult(br_inv(this.num_str,right_word[j],assignment[assignment.length-1]),right_scan_mat),br(this.num_str,right_word[j],new non_comm_poly([[1,["b_{"+String(this.reeb_label[k+j+1])+"}"],[1]]])));
                right_scan_mat = lower_truncate(right_scan_mat);
            } else {
                assignment.push(new non_comm_poly([[1,["p_{"+String(this.reeb_label[k+j+1])+"}"],[1]]]));
                right_scan_mat = non_comm_matrix_mult(non_comm_matrix_mult(mk_pt_inv(this.num_str,right_word[j],"p_{"+String(this.reeb_label[k+j+1])+"}"),right_scan_mat),mk_pt(this.num_str,right_word[j],"p_{"+String(this.reeb_label[k+j+1])+"}"));
            }
        }
        left_word.reverse();
        this.word[k]=[this.word[k],this.word[k]+1];
        return(assignment);
    }

    ccw_rot() {
        var level = this.word.pop();
        this.word.splice(0,0,level);
        var last_label = this.reeb_label.pop();
        this.reeb_label.splice(0,0,last_label);
        if (Number.isInteger(level)) {
            this.mk_pt_label[level-1] = [this.mk_pt_label[level],this.mk_pt_label[level]=this.mk_pt_label[level-1]][0];
            var mat = eye(this.num_str);
            for (var m of this.trans_mat()) {
                mat = non_comm_matrix_mult(mat,m);
            }
            for (var k=0;k<level-1;k++) {
                var new_mat = [];
                for (var i=0;i<this.num_str-k-1;i++) {
                    new_mat.push([]);
                    for (var j=0;j<this.num_str-k-1;j++){
                        new_mat[i].push(add(mat[i+1][j+1],mult(mult(mat[i+1][0],new non_comm_poly([[1,["t_{"+String(this.mk_pt_label[k])+"}"],[1]]])),mat[0][j+1])));
                    }
                }
                mat = new_mat; 
            }
            var assignment = mult(new non_comm_poly([[1,["t_{"+String(this.mk_pt_label[level-1])+"}"],[1]]]),mat[0][1]);
            return(assignment);
        } else {
            return(0);
        }
    }

    cw_rot() {
        var level = this.word.shift();
        this.word.splice(this.word.length,0,level);
        var first_label = this.reeb_label.shift();
        this.reeb_label.splice(this.reeb_label.length,0,first_label);
        if (Number.isInteger(level)) {
            this.mk_pt_label[level-1] = [this.mk_pt_label[level],this.mk_pt_label[level]=this.mk_pt_label[level-1]][0];
            var mat = eye(this.num_str);
            for (var m of this.trans_mat()) {
                mat = non_comm_matrix_mult(mat,m);
            }
            for (var k=0;k<level-1;k++) {
                var new_mat = [];
                for (var i=0;i<this.num_str-k-1;i++) {
                    new_mat.push([]);
                    for (var j=0;j<this.num_str-k-1;j++){
                        new_mat[i].push(add(mat[i+1][j+1],mult(mult(mat[i+1][0],new non_comm_poly([[1,["t_{"+String(this.mk_pt_label[k])+"}"],[1]]])),mat[0][j+1])));
                    }
                }
                mat = new_mat; 
            }
            var assignment = mult(mat[1][0],new non_comm_poly([[1,["t_{"+String(this.mk_pt_label[level-1])+"}"],[1]]]));
            return(assignment);
        } else {
            return(0);
        }
    }

    commute(left,right) {
        var mat = eye(this.num_str);
        for (var i=left+1;i<right;i++) {
            mat = non_comm_matrix_mult(mat, mk_pt(this.num_str, this.word[i], "p_{"+String(this.reeb_label[i])+"}"));
        }
        var left_assignment = mult(mult(mat[this.word[left]][this.word[left]],new non_comm_poly([[1,["b_{"+this.reeb_label[right]+"}"],[1]]])),mat[this.word[left]-1][this.word[left]-1].mono_inv());
        var right_assignment = mult(mult(mat[this.word[right]-1][this.word[right]-1].mono_inv(),new non_comm_poly([[1,["b_{"+this.reeb_label[left]+"}"],[1]]])),mat[this.word[right]][this.word[right]]);
        for (var i=left+1;i<right;i++) {
            this.word[i][0] = cyclic_switch(cyclic_switch(this.word[i][0],[this.word[left],this.word[left]+1]),[this.word[right],this.word[right]+1]);
            this.word[i][1] = cyclic_switch(cyclic_switch(this.word[i][1],[this.word[left],this.word[left]+1]),[this.word[right],this.word[right]+1]);
        }
        this.word[left] = [this.word[right],this.word[right] = this.word[left]][0];
        return([left_assignment,right_assignment]);
    }

    braid_move(left,middle,right) {
        var left_mat = eye(this.num_str);
        for (var i=left+1;i<middle;i++) {
            left_mat = non_comm_matrix_mult(left_mat, mk_pt(this.num_str,this.word[i],"p_{"+String(this.reeb_label[i])+"}"));
        }
        var right_mat = eye(this.num_str);
        for (var i=middle+1;i<right;i++) {
            right_mat = non_comm_matrix_mult(right_mat, mk_pt(this.num_str,this.word[i],"p_{"+String(this.reeb_label[i])+"}"));
        }
        if (this.word[left]<this.word[middle]) {
            var upper = this.word[left]-1;
            var mid = upper+1;
            var lower = mid+1;
            var left_assignment = mult(mult(mult(left_mat[mid][mid],right_mat[lower][lower]),new non_comm_poly([[1,["b_{"+String(this.reeb_label[right])+"}"],[1]]])),mult(right_mat[upper][upper].mono_inv(),left_mat[upper][upper].mono_inv()));
            var middle_assignment = subtract(new non_comm_poly([[1,["b_{"+String(this.reeb_label[middle])+"}"],[1]]]),mult(mult(mult(right_mat[lower][lower],new non_comm_poly([[1,["b_{"+String(this.reeb_label[right])+"}"],[1]]])), right_mat[upper][upper].mono_inv()),mult(mult(left_mat[upper][upper].mono_inv(), new non_comm_poly([[1,["b_{"+String(this.reeb_label[left])+"}"],[1]]])),left_mat[lower][lower])));
            var right_assignment = mult(mult(mult(right_mat[upper][upper].mono_inv(),left_mat[upper][upper].mono_inv()), new non_comm_poly([[1,["b_{"+String(this.reeb_label[left])+"}"],[1]]])),mult(left_mat[lower][lower],right_mat[mid][mid]));
            upper += 1;
            mid += 1;
            lower += 1;
            for (var i=left;i<right+1;i++) {
                if (i==middle) {
                    this.word[i]=upper;
                } else if (i==left||i==right) {
                    this.word[i]=mid;
                } else {
                    this.word[i][0] = cyclic_switch(this.word[i][0],[lower,mid,upper]);
                    this.word[i][1] = cyclic_switch(this.word[i][1],[lower,mid,upper]);
                }
            }
        } else {
            var upper = this.word[middle]-1;
            var mid = upper+1;
            var lower = mid+1;
            var left_assignment = mult(mult(mult(left_mat[lower][lower],right_mat[lower][lower]),new non_comm_poly([[1,["b_{"+String(this.reeb_label[right])+"}"],[1]]])),mult(right_mat[upper][upper].mono_inv(),left_mat[mid][mid].mono_inv()));
            var middle_assignment = add(new non_comm_poly([[1,["b_{"+String(this.reeb_label[middle])+"}"],[1]]]),mult(mult(mult(left_mat[upper][upper].mono_inv(),new non_comm_poly([[1,["b_{"+String(this.reeb_label[left])+"}"],[1]]])),left_mat[lower][lower]),mult(mult(right_mat[lower][lower],new non_comm_poly([[1,["b_{"+String(this.reeb_label[right])+"}"],[1]]])),right_mat[upper][upper].mono_inv())));
            var right_assignment = mult(mult(mult(right_mat[mid][mid].mono_inv(),left_mat[upper][upper].mono_inv()),new non_comm_poly([[1,["b_{"+String(this.reeb_label[left])+"}"],[1]]])),mult(left_mat[lower][lower],right_mat[lower][lower]));
            upper += 1;
            mid += 1;
            lower += 1;
            for (var i=left;i<right+1;i++) {
                if (i==middle) {
                    this.word[i]=mid;
                } else if (i==left||i==right) {
                    this.word[i]=upper;
                } else {
                    this.word[i][0] = cyclic_switch(this.word[i][0],[upper,mid,lower]);
                    this.word[i][1] = cyclic_switch(this.word[i][1],[upper,mid,lower]);
                }
            }
        }
        return([left_assignment,middle_assignment,right_assignment]);
    }

    initial_cluster(sm = 0) {
        var sign_mat =[];
        if (sm == 0) {
            for (var i=0;i<this.num_str;i++) {
                sign_mat.push(1);
            }
        } else {
            sign_mat = arrayClone(sm);
        }
        var left_vertex = [];
        for (var i=0;i<this.num_str+1;i++) {
            left_vertex.push(-1);
        }
        var ex_mat = [];
        for (var i=0;i<this.length();i++) {
            ex_mat.push([]);
            for (var j=0;j<this.length();j++) {
                ex_mat[i].push(0);
            }
        }
        for (var k=0;k<this.length();k++) {
            if (left_vertex[this.word[k]] == -1) {
                for (var j of [this.word[k]-1,this.word[k]+1]) {
                    if (left_vertex[j] >= 0) {
                        ex_mat[k][left_vertex[j]] += 0.5;
                        ex_mat[left_vertex[j]][k] -= 0.5;
                    } 
                }
            } else {
                ex_mat[left_vertex[this.word[k]]][k] = 1;
                ex_mat[k][left_vertex[this.word[k]]] = -1; 
                for (var j of [this.word[k]-1,this.word[k]+1]) {
                    if (left_vertex[j] >= 0) {
                        ex_mat[left_vertex[this.word[k]]][left_vertex[j]] -= 0.5;
                        ex_mat[left_vertex[j]][left_vertex[this.word[k]]] += 0.5;
                        ex_mat[k][left_vertex[j]] += 0.5;
                        ex_mat[left_vertex[j]][k] -= 0.5;
                    }
                }      
            }
            left_vertex[this.word[k]] = k;
        }
        var variables = [];
        var mat = [];
        for (var i=0;i<this.num_str;i++) {
            mat.push([]);
            for (var j=0;j<this.num_str;j++) {
                if (i==j) {
                    mat[i].push(new poly([[1,{}]]));
                } else {
                    mat[i].push(new poly([]));
                }
            }
        }
        var to_mult = [];
        for (var k=0;k<this.length();k++) {
            to_mult = [];
            for (var i=0;i<this.num_str;i++) {
                to_mult.push([]);
                if (i==this.word[k]-1) {
                    for (var j=0;j<this.num_str;j++) {
                        if (j==i) {
                            var x = {};
                            x["b_{"+String(this.reeb_label[k])+"}"]=1;
                            to_mult[i].push(new poly([[sign_mat[this.word[k]-1]*sign_mat[this.word[k]],x]]));
                        } else if (j==i+1) {
                            to_mult[i].push(new poly([[-1,{}]]));
                        } else {
                            to_mult[i].push(new poly([]));
                        }
                    }
                } else if (i== this.word[k]) {
                    for (var j=0;j<this.num_str;j++) {
                        if (j==i-1) {
                            to_mult[i].push(new poly([[1,{}]]));
                        } else {
                            to_mult[i].push(new poly([]));
                        }
                    }
                } else {
                    for (var j=0;j<this.num_str;j++) {
                        if (j==i) {
                            to_mult[i].push(new poly([[1,{}]]));
                        } else {
                            to_mult[i].push(new poly([]));
                        }
                    }
                }
            }
            mat = comm_matrix_mult(mat,to_mult);
            variables.push(principal_minor(mat,this.word[k]));
            var s = sign_mat[this.word[k]-1];
            sign_mat[this.word[k]-1] = sign_mat[this.word[k]];
            sign_mat[this.word[k]] = -s;
        }
        var frozen = [];
        for (var k=0;k<this.num_str;k++) {
            if (left_vertex[k] >=0 ){
                frozen.push(left_vertex[k]+1);
            }
        }
        return(new cluster(ex_mat,variables,frozen));
    }

}

function fq_pts(b) {
    var occurrence=[];
    var u =[];
    polynomial = new poly([]);
    for (var m=0;m<Math.pow(2,b.length());m++) {
        factor = new poly([[1,{}]]);
        occurrence = binary(m,b.length());
        u = [];
        for (var j=0;j<b.num_str;j++) {
            u.push(j);
        }
        for (var i=0;i<b.length();i++) {
            if (occurrence[i]==0 && u[b.word[i]-1]>u[b.word[i]]) {
                break
            } else if (occurrence[i]==1) {
                if (u[b.word[i]-1]>u[b.word[i]]) {
                    factor = mult(factor, new poly([[1,{"q":1}]]));
                }
                u[b.word[i]-1] = [u[b.word[i]],u[b.word[i]]=u[b.word[i]-1]][0];
            } else {
                factor = mult(factor,new poly([[1,{"q":1}],[-1,{}]]));
            }
        }
        if (u.every(function(a){return(a==u.indexOf(a))})) {
            polynomial = add(polynomial,factor);
        }
    }
    polynomial.sort_terms(["q"]);
    return(polynomial);
}