from setuptools import setup

setup(
    name='gnnvis',
    version='0.0.0',
    url='http://flask.pocoo.org/docs/tutorial/',
    install_requires=[
        'flask',
    ],
    entry_points={
        'console_scripts': [
            'gnnvis=gnn_vis:cli'
        ],
    },
)