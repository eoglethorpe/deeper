echo "Pulling react-store"
git -C src/public pull --rebase

echo "Pulling ravl"
git -C src/vendor/ravl pull --rebase
