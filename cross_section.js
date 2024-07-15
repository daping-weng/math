function initialCrossSection(n) {
    var output = [];
    var term = [];
    for (var i=0;i<n;i++) {
        term = [];
        for (var j=0;j<i;j++) {
            term.push(0);
        }
        term.push(-i-1);
        for (var j=1;j<n-i;j++) {
            term.push(j);
        }
        output.push([...term]);
    }
    return(new crossSection(output));
}

function row_sum(matrix, i) {
    var output = 0;
    for (var j=0;j<matrix[0].length;j++) {
        output += matrix[i][j];
    }
    return (output);
}

function column_sum(matrix,j ) {
    var output=0;
    for (var i=0;i<matrix.length;i++) {
        output += matrix[i][j];
    }
    return(output);
}

class crossSection {
    constructor(crossingMatrix) {
        this.crossingMatrix = crossingMatrix; 
        //will mark the crossings with the weave color number, the strands with negative integer, and the empty spots with 0.
    }

    rank() {
        return(this.crossingMatrix.length);
    }

    bridge(letter) {
        var b = 0;
        var w = 0
        if (letter < 0) {
            letter = -letter;
            for (var j=0;j<this.rank();j++) {
                if (this.crossingMatrix[letter-1][j]<0) {
                    w = j+1;
                } else if (this.crossingMatrix[letter][j]<0) {
                    b = j+1;
                    break;
                }
            }
            return([[letter+1,b],[letter,w]]);
        } else if (letter > 0) {
            for (var i=0;i<this.rank();i++) {
                if (this.crossingMatrix[i][letter-1]<0) {
                    b = i+1;
                } else if (this.crossingMatrix[i][letter]<0) {
                    w = i+1;
                    break;
                }
            }
            return([[b,letter],[w,letter+1]]);
        }
    }

    switch(letter) {
        var exchange = false;
        var coord = 0;
        if (letter < 0) {
            letter = -letter;
            for (var j=this.rank()-1;j>=0;j--) {
                if (exchange) {
                    this.crossingMatrix[letter][j] = this.crossingMatrix[letter-1][j];
                    this.crossingMatrix[letter-1][j] = 0;
                } else if (this.crossingMatrix[letter][j] < 0) {
                    this.crossingMatrix[letter-1][j] = this.crossingMatrix[letter][j];
                    this.crossingMatrix[letter][j] = 0;
                    coord = j+1;
                    exchange = true;
                }
            }
            return([letter,coord])
        } else if (letter > 0) {
            for (var i=0;i<this.rank();i++) {
                if (exchange) {
                    this.crossingMatrix[i][letter-1] = this.crossingMatrix[i][letter];
                    this.crossingMatrix[i][letter] = 0;
                } else if (this.crossingMatrix[i][letter-1]<0) {
                    this.crossingMatrix[i][letter] = this.crossingMatrix[i][letter-1];
                    this.crossingMatrix[i][letter-1] = 0;
                    coord = i+1;
                    exchange = true; 
                }
            }
            return([coord,letter+1]);
        }
    }

    bridgeTshift(letter) {
        var vertices = this.bridge(letter);
        var b = vertices[0];
        var w = vertices[1];
        var output = [];
        if (letter <0) {
            letter = -letter;
            for (var j=b[1]-1;j<this.rank();j++) {
                if (this.crossingMatrix[w[0]-1][j]>0) {
                    output.push([w[0],j+1]);
                }
            }
        } else if (letter > 0) {
            for (var i=b[0]-1;i>=0;i--) {
                if (this.crossingMatrix[i][w[1]-1]>0) {
                    output.push([i+1,w[1]]);
                }
            }
        }
        return(output);
    }

    crossingTshift(letter) {
        var vertex = this.switch(letter);
        //console.log(vertex);
        var output = [vertex];
        if (letter < 0) {
            for (var j=vertex[1];j<this.rank();j++) {
                if (this.crossingMatrix[vertex[0]-1][j] > 0) {
                    output.push([vertex[0],j+1]);
                }
            }
        } else if (letter > 0) {
            for (var i=vertex[0]-1;i>=0;i--) {
                if (this.crossingMatrix[i][vertex[1]-1] >0) {
                    output.push([i+1,vertex[1]]);
                }
            }
        }
        return(output);
    }

    height() {
        var output = [];
        var term = [];
        for (var i=0;i<this.rank();i++) {
            term = [];
            for (var j=0;j<this.rank();j++) {
                if (this.crossingMatrix[i][j]<0) {
                    term.push(j-i);
                } else {
                    term.push(0);
                }
            }
            output.push([...term]);
        }
        return(output);
    }

    location(level) {
        for (var i=0;i<this.rank();i++) {
            for (var j=0;j<this.rank();j++) {
                if (this.crossingMatrix[i][j] < 0) {
                    if (this.crossingMatrix[i][j] == -level) {
                        return([i+1,j+1]);
                    } else {
                        break;
                    }
                }
            }
        }
    }
}