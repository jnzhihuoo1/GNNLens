# GNNVis

This is the code repository for the paper "GNNVis: A Visual Analytics Approach for Prediction Error Diagnosis of Graph Neural Networks". 

## Backend

1. Install the required packages.

```
conda create -n gnnvis python=3.7
source activate gnnvis
conda install pytorch==1.6.0 torchvision==0.7.0 cudatoolkit=10.1 -c pytorch
pip --no-cache-dir install torch_scatter==1.2.0
pip --no-cache-dir install torch_sparse==0.4.3
pip install torch-cluster -f https://pytorch-geometric.com/whl/torch-1.6.0+cu101.html
pip --no-cache-dir install torch_geometric==1.3.2
cd server
pip install -r requirements.txt
cd ..
```

2. Prepare models.

```
cd server
unzip models.zip
cd ..
```

3. Start the server.

```
python server/gnn_server/server.py
```


## Frontend

1. Install the required packages.
```
cd gnnvis
npm install
cd ..
```

2. Start the frontend.

```
cd gnnvis
npm start
cd ..
```

## Reference

Please consider citing our paper if you find GNNVis useful.

``` bibtex
@article{jin2020gnnvis,
  title={GNNVis: A Visual Analytics Approach for Prediction Error Diagnosis of Graph Neural Networks},
  author={Jin, Zhihua and Wang, Yong and Wang, Qianwen and Ming, Yao and Ma, Tengfei and Qu, Huamin},
  journal={arXiv preprint arXiv:2011.11048},
  year={2020}
}
```
