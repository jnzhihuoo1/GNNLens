
export default class HCluster{
    public distance = (vector1:any, vector2:any)=>{
        return 0;
    };
    public linkage:string = "single";
    public distMatrix:any = null;
    public showMode:number = 1;
    public vector_type:any[] = [];
    constructor(showMode:number){
        this.showMode = showMode;
        
    }
    public setlinkage(linkage:string){
        this.linkage = linkage;
    }
    public setDistMatrix(x:any){
        this.distMatrix = x.map(function(y:any) { return y.slice(0); });
        //this.distMatrix = distMatrix;
    }
    public setDistance(distance:any){
        this.distance = distance;
    }
    public cluster(vectors:any, limit_distance:number=0.5){
        var n:number = vectors.length,
            dMin:any = [],
            cSize:any = [],
            clusters:any = [],
            c1:any,
            c2:any,
            c1Cluster:any,
            c2Cluster:any,
            p:any,
            root:any,
            i:any,
            j:any,
            id:number = 0,
            clusterflag:any  = [];
            //limit_distance = 0.5;

        // Initialise distance matrix and vector of closest clusters.
        if (this.distMatrix === null) {
            this.distMatrix = [];
            i = -1; 
            while (++i < n) {
                dMin[i] = 0;
                this.distMatrix[i] = [];
                j = -1; 
                while (++j < n) {
                    this.distMatrix[i][j] = i === j ? Infinity : this.distance(vectors[i] , vectors[j]);
                    if (this.distMatrix[i][dMin[i]] > this.distMatrix[i][j]) dMin[i] = j;
                }
            }
        }
        else {
            if (this.distMatrix.length < n || this.distMatrix[0].length < n)
                throw {error: "Provided distance matrix length "+this.distMatrix.length+" instead of "+n};
            i = -1; 
            while (++i < n) {
                dMin[i] = 0;
                j = -1; 
                while (++j < n) {
                    if (i === j)
                        this.distMatrix[i][j] = Infinity;
                    if (this.distMatrix[i][dMin[i]] > this.distMatrix[i][j]) dMin[i] = j;
                }
            }
        }
        // create leaves of the tree
        i = -1; 
        while (++i < n) {
            if (i != id) console.log("i = %d, id = %d", i, id);
            clusters.push([]);
            clusterflag.push(true);
            clusters[i].push({
                "left": null,
                "right": null,
                "dist": 0,
                "centroid": vectors[i],
                "id": id, //[jdf] keep track of original data index
                "size": 1,
                "depth": 0,
                "id_list": [id] // save original id.
            });
            id++;
            cSize[i] = 1;
        }
        
        // Main loop
        for (p = 0; p < n-1; p++) {
            // find the closest pair of clusters
            c1 = 0;
            for (i = 0; i < n; i++) {
                if (this.distMatrix[i][dMin[i]] < this.distMatrix[c1][dMin[c1]]) c1 = i;
            }
            c2 = dMin[c1];

            // create node to store cluster info 
            c1Cluster = clusters[c1][0];
            c2Cluster = clusters[c2][0];
            if(this.distMatrix[c1][c2]>limit_distance){
                break;
            }
            var newCluster:any = {
                left: c1Cluster,
                right: c2Cluster,
                dist: this.distMatrix[c1][c2],
                centroid: this.calculateCentroid(c1Cluster.size, c1Cluster.centroid,
                                            c2Cluster.size, c2Cluster.centroid),
                id: id++,
                size: c1Cluster.size + c2Cluster.size,
                depth: 1 + Math.max(c1Cluster.depth, c2Cluster.depth),
                id_list: c1Cluster.id_list.concat(c2Cluster.id_list)
            };
            clusters[c1].splice(0, 0, newCluster);
            cSize[c1] += cSize[c2];

            // overwrite row c1 with respect to the linkage type
            for (j = 0; j < n; j++) {
                switch (this.linkage) {
                case "single":
                    if (this.distMatrix[c1][j] > this.distMatrix[c2][j])
                        this.distMatrix[j][c1] = this.distMatrix[c1][j] = this.distMatrix[c2][j];
                    break;
                case "complete":
                    if (this.distMatrix[c1][j] < this.distMatrix[c2][j])
                        this.distMatrix[j][c1] = this.distMatrix[c1][j] = this.distMatrix[c2][j];
                    break;
                case "average":
                    this.distMatrix[j][c1] = this.distMatrix[c1][j] = (cSize[c1] * this.distMatrix[c1][j] + cSize[c2] * this.distMatrix[c2][j]) / (cSize[c1] + cSize[j]);
                    break;
                }
            }
            this.distMatrix[c1][c1] = Infinity;
            clusterflag[c2] = false;
            for (i = 0; i < n; i++)
                this.distMatrix[i][c2] = this.distMatrix[c2][i] = Infinity;

            // update dmin and replace ones that previous pointed to c2 to point to c1
            for (j = 0; j < n; j++) {
                if (dMin[j] == c2) dMin[j] = c1;
                if (this.distMatrix[c1][j] < this.distMatrix[c1][dMin[c1]]) dMin[c1] = j;
            }

            // keep track of the last added cluster
            root = newCluster;
        }
        //console.log("clusterflag",clusterflag);
        let valid_cluster:any = [];
        for(let i = 0; i<clusterflag.length; i++){
            if(clusterflag[i] === true){
                valid_cluster.push(clusters[i][0]);
            }
        }
        return valid_cluster;
    }
    public calculateCentroid(c1Size:number, c1Centroid:any, c2Size:number, c2Centroid:any) {
        var newCentroid = [],
            newSize = c1Size + c2Size,
            n = c1Centroid.length,
            i = -1;
        while (++i < n) {
          newCentroid[i] = (c1Size * c1Centroid[i] + c2Size * c2Centroid[i]) / newSize;
        }
        return newCentroid;
      }
}
/*
science.stats.hcluster = function() {
    var distance = reorder.distance.euclidean,
        linkage = "single", // single, complete or average
        distMatrix = null;
  
    function hcluster(vectors) {
      
    }
  
    hcluster.linkage = function(x) {
      if (!arguments.length) return linkage;
      linkage = x;
      return hcluster;
    };
  
    hcluster.distance = function(x) {
      if (!arguments.length) return distance;
      distance = x;
      return hcluster;
    };
  
    hcluster.distanceMatrix = function(x) {
      if (!arguments.length) return distMatrix;
      distMatrix = x.map(function(y) { return y.slice(0); });
      return hcluster;
    };
  
    return hcluster;
  };
  
*/