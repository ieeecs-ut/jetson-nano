# jetson-nano

In-office Jetson Nano server configuration &amp; information.

## nano gateway

This site provides control/config info from the Nano (which is on a private network, utexas/utexas-iot) to a secured web page on the public internet via Socket.IO.

- Use this to get the current url of the Nano's web server. (It changes every day because it is tunneled by ngrok for free, upgrade the plan to keep it constant).
  - You can access this ngrok URL from anywhere, not just at UT or with UT VPN.
- Use this also to get the internal dynamic IP address of the Nano on the utexas/utexas-iot network for SSH/SFTP purposes.
  - That way when you are on UT wifi or UT's VPN, you can remotely access/control/work on the Jetson Nano.
  - This API is password-protected for security reasons.
  - Alternatively you can scan the network for IP addresses but this may not work as the routers will remove current/old records for networked devices that dont get used often.

&nbsp;&nbsp;  
Hosted on heroku: https://ieeecs-nano.herokuapp.com/  
Alternatively on https://nano.anuv.me

### details

- branch `heroku` contains symlinks in the top level that allow heroku to run the backend app
  - when deploying, push this repo's branch heroku to Heroku's repo's branch main, as such: `git push heroku heroku:main`
    - first `heroku` is the remote target, which you can set locally as such: `heroku git:remote -a example-app`
    - second `heroku` is the local branch heroku, you can get with `git checkout heroku`
    - `main` is a branch on the remote git repo Heroku hosts for you, and Heroku requires you to push to main if you want to build & deploy your app. But our repo's branch `main` has the code in a subfolder, which heroku does not like. So we made a branch with symlinks (aka shortcuts, aliases) to help Heroku out.
- environment variables are required:
  - `AUTH_PWD` password to access the Nano's internal IP (set this yourself in the shell/in heroku)
  - `PORT` port for the backend process, (provided by heroku), defaults to 3004 or 3000 based on `PROD`
  - `PROD` not actually an env var, just a constant that can be changed in the code for debugging & local testing

## software setup

essential:

- build-essential
  - install/upgrade via apt
- node/npm
  - install via n bash script
  - then install n via npm (npm install -g n)
- cuda
  - preinstalled —> update paths in bashrc only
- python prereqs
  - install via apt: python3-venv, python3-setuptools, python3-pip
- scipy prereqs
  - cmake (upgrade version)
    wget http://www.cmake.org/files/v3.13/cmake-3.13.0.tar.gz
    tar xpvf cmake-3.13.0.tar.gz cmake-3.13.0/
    cd cmake-3.13.0/
    ./bootstrap --system-curl
    make -j8
    echo 'export PATH=/home/$USER/cmake-3.13.0/bin/:$PATH' >> ~/.bashrc
    source ~/.bashrc
  - install via apt: protobuf-compiler libprotobuf-dev openssl libssl-dev libcurl4-openssl-dev
  - install via apt: gfortran libfreetype6-dev libblas3 liblapack3 liblapack-dev libblas-dev libatlas-base-dev
- tensorflow prereqs
  - install via apt: gfortran liblapack-dev libblas-dev libhdf5-serial-dev hdf5-tools libhdf5-dev zlib1g-dev zip libjpeg8-dev

pip:

- n.b.: use (sudo) python3 -m pip install -U
- pip (upgrade)
- wheel
- cython
- pybind11
- testresources
- setuptools==49.6.0
- for tensorflow:
  - numpy==1.19.3
  - scipy==1.5.0 (install latest version from source manually: ie. https://github.com/scipy/scipy/releases/download/v1.5.0/scipy-1.5.0.tar.gz)
    wget https://github.com/scipy/scipy/releases/download/v1.5.0/scipy-1.5.0.tar.gz
    tar -xzvf scipy-1.5.0.tar.gz scipy-1.5.0
    cd scipy-1.5.0/
    python3 setup.py install --user
    - this will take a while (up to/more than an hour)
  - python3 -m pip install -U --no-deps numpy==1.19.3 future==0.18.2 mock==3.0.5 keras_preprocessing==1.1.2 keras_applications==1.0.8 gast==0.4.0 protobuf pybind11 cython pkgconfig
    - also: env H5PY_SETUP_REQUIRES=0 python3 -m pip install -U h5py==3.1.0
      - if doesnt work, try:
        - env H5PY_SETUP_REQUIRES=0 python3 -m pip install --no-build-isolation -U h5py==3.1.0
        - https://github.com/h5py/h5py/issues/1771
  - if venv, slightly different:
    - python3 -m pip install -U numpy grpcio absl-py py-cpuinfo psutil portpicker six mock requests gast h5py astor termcolor protobuf keras-applications keras-preprocessing wrapt google-pasta setuptools testresources
  - tensorflow (not tensorflow-gpu, was renamed into tensorflow)
    - python3 -m pip install --pre --extra-index-url https://developer.download.nvidia.com/compute/redist/jp/v46 tensorflow

optional:

- tmux
  - install via apt
- reptryr
  - build from source (clone https://github.com/nelhage/reptyr and run `make`)

## guides

- https://docs.nvidia.com/deeplearning/frameworks/install-tf-jetson-platform/index.html
- https://stackoverflow.com/questions/65631801/illegal-instructioncore-dumped-error-on-jetson-nano
