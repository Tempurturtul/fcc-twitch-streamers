echo "-----------------------------"
echo "Beginning provision.sh..."
echo "-----------------------------"
echo "Updating packages."
sudo apt-get update
echo "Installing git."
sudo apt-get install -y git
echo "Installing libfontconfig."
sudo apt-get install -y libfontconfig
echo "Installing nodejs."
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Updating npm."
sudo npm install -g npm
echo "Installing build-essential."
sudo apt-get install -y build-essential
echo "Installing gulp globally."
sudo npm install -g gulp
echo "Installing jshint globally."
sudo npm install -g jshint
echo "Updating packages."
sudo apt-get update
echo "Provisioning finished!"
echo "Login with: vagrant ssh"
echo "Navigate to project directory with: cd /vagrant"
echo "Tear-down with: vagrant destroy"
echo "-----------------------------"
echo "Ending provision.sh..."
echo "-----------------------------"
