class front {
    constructor(ob_list = [], ob_level = [], all_levels = [[]], total_num_levels=0) {
        this.ob_list = ob_list;
        this.ob_level = ob_level;
        this.all_levels = all_levels;
        this.total_num_levels = 0;
    }

    clear() {
        this.ob_list = [];
        this.ob_level = [];
        this.all_levels = [[]];
        this.total_num_levels = 0;
    }

    

    add_left_cusp(a) {
        this.ob_list.push("l");
        for (var i=0;i<this.ob_level.length;i++) {
            for (var j=0;j<2;j++) {
                if (this.ob_level[i][j] > a) {
                    this.ob_level[i][j] += 2;
                }
            }
            for (var j=0;j<this.all_levels[i+1].length;j++) {
                if (this.all_levels[i+1][j] > a) {
                    this.all_levels[i+1][j] += 2;
                }
            }
        }
        this.ob_level.push([a+1,a+2]);
        var previous_levels = this.all_levels[this.all_levels.length-1].slice();
        var k = 0;
        while (previous_levels[k] <= a) {
            k++;
        }
        previous_levels.splice(k,0,a+1,a+2);
        this.all_levels.push(previous_levels);
        this.total_num_levels += 2;
    }

    add_crossing(a) {
        this.ob_list.push("c");
        var previous_levels = this.all_levels[this.all_levels.length-1].slice();
        var k = 0;
        while (previous_levels[k] <= a) {
            k++;
        }
        this.ob_level.push([previous_levels[k-1],previous_levels[k]]);
        this.all_levels.push(previous_levels);
    }

    add_right_cusp(a) {
        this.ob_list.push("r");
        var previous_levels = this.all_levels[this.all_levels.length-1].slice();
        var k = 0;
        while (previous_levels[k] <= a) {
            k++;
        }
        this.ob_level.push([previous_levels[k-1],previous_levels[k]]);
        previous_levels.splice(k-1,2);
        this.all_levels.push(previous_levels);
    }

    backspace() {
        if (!(this.ob_list[this.ob_list.length-1] == "l")) {
            this.ob_list.splice(this.ob_list.length-1,1);
            this.ob_level.splice(this.ob_level.length-1,1);
            this.all_levels.splice(this.all_levels.length-1,1);
        } else {
            var a = this.ob_level[this.ob_level.length-1][1];
            for (var i=0;i<this.ob_level.length-1;i++) {
                for (var j=0;j<2;j++) {
                    if (this.ob_level[i][j] > a) {
                        this.ob_level[i][j] -= 2;
                    }
                }
                for (var j=0;j<this.all_levels[i+1].length;j++) {
                    if (this.all_levels[i+1][j] > a) {
                        this.all_levels[i+1][j] -= 2;
                    }
                }
            }
            this.ob_list.splice(this.ob_list.length-1,1);
            this.ob_level.splice(this.ob_level.length-1,1);
            this.all_levels.splice(this.all_levels.length-1,1);
            this.total_num_levels -= 2;
        }
    }

    check_ruling(crossing_types) {
        var eyes = [];
        var output = true;
        for (var i=0;i<this.ob_list.length;i++) {
            //console.log(String(eyes));
            if (crossing_types[i] == "l") {
                var new_eye = this.ob_level[i].slice();
                eyes.push(new_eye);
            } else if ((crossing_types[i] == "ns" || crossing_types[i] == "dp") || crossing_types[i] == "rt") {
                var a = this.ob_level[i][0];
                var b = this.ob_level[i][1];
                var c = 0;
                var d = 0;
                for (var j=0;j<eyes.length;j++) {    
                    if (eyes[j][0] == a && eyes[j][1] == b) {
                        output = false;
                        break;
                    } else if (eyes[j][0] == a) {
                        eyes[j][0] = b;
                        c = eyes[j][1];
                    } else if (eyes[j][1] == a) {
                        eyes[j][1] = b;
                        c = eyes[j][0];
                    } else if (eyes[j][0] == b) {
                        eyes[j][0] = a;
                        d = eyes[j][1];
                    } else if (eyes[j][1] == b) {
                        eyes[j][1] = a;
                        d = eyes[j][0];
                    }
                    if (((d<a && b<c) || (c<d && d<a)) || (b<c && c<d)) {
                        crossing_types[i] = "rt";
                        //console.log("rt",a,b,c,d);
                    } else {
                        crossing_types[i] = "dp";
                        //console.log("dp",a,b,c,d);
                    }
                }
            } else if (crossing_types[i] == "sw") {
                var a = this.ob_level[i][0];
                var b = this.ob_level[i][1];
                for (var j=0;j<eyes.length;j++) {
                    if (eyes[j][0] == a) {
                        var c = eyes[j][1];
                    } else if (eyes[j][1] == a) {
                        var c = eyes[j][0];
                    } else if (eyes[j][0] == b) {
                        var d = eyes[j][1];
                    } else if (eyes[j][1] == b) {
                        var d = eyes[j][0];
                    }
                }
                if (!((c>a && d>b && c>d) || (a>c && b>d && c>d) || (a>c && d>b))) {
                    output = false;
                }
            } else {
                var a = this.ob_level[i][0];
                var b = this.ob_level[i][1];
                for (var j =0;j<eyes.length;j++) {
                    if (eyes[j][0] == a) {
                        if (eyes[j][1] != b) {
                            output = false
                            break;
                        } else {
                            eyes.splice(j,1);
                            break;
                        }
                    }
                }
            }
            if (output == false) {
                break;
            }
        }
        return(output);
    }
}