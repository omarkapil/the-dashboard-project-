# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Prune networks forcefully
docker network prune -f

# Specific check for our subnet
docker network ls --format "{{.Name}}" | ForEach-Object {
    $net = $_
    $subnet = docker network inspect $net --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}'
    if ($subnet -like "172.25.0.*") {
         Write-Host "Removing conflicting network: $net"
         docker network rm $net
    }
}
