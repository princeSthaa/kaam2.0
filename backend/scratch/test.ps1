$obj = @{
    name = "Sunrise Yarns Ltd"
    contactEmail = "contact@sunriseyarns.com"
    contactPhone = "+977-1-4433221"
    address = "Lalitpur, Nepal"
    status = "Active"
}
$json = $obj | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:5083/api/supplier" -Method POST -Body $json -ContentType "application/json"
$res | ConvertTo-Json
