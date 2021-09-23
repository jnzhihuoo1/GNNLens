from setuptools import setup, find_packages

setup(
    name='gnnlens',
    version='0.0.0',
    url='http://flask.pocoo.org/docs/tutorial/',
    install_requires=[
        'flask',
    ],
    packages=find_packages(include=['gnnlens', 'gnnlens.*']),
    package_data={'gnnlens': ['visbuild/*', 'visbuild/static/js/*', 'visbuild/static/css/*', 'visbuild/static/media/*']},
    entry_points={
        'console_scripts': [
            'gnnlens=gnnlens.server:start_server'
        ],
    },
)