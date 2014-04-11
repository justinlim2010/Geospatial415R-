# Function to convert to GeoJSON
togeojson <- function(file, projection) {
  # Required library
  require(httr)
  
  # Send request to ogre.adc4gis.com
  url <- "http://ogre.adc4gis.com/convert"
  tt <- POST(url, body = list(
      upload = upload_file(file),
      sourceSrs = projection,
      targetSrs = "EPSG:4326"
    )
  )
  
  # Convert request response as text
  out <- content(tt, as = "text")
}

# Function to convert to SHPfile
toshpfile <- function(text) {
  # Required library
  require(httr)
  
  # Send request to ogre.adc4gis.com
  url <- "http://ogre.adc4gis.com/convertJson"
  tt <- POST(url, body = list(
      json = text
    )
  )
  
  # Convert request response as text
  out <- content(tt, "raw")
}

# Function to transform GeoJSON projection
transformProjection <- function(text, projection) {
  # Convert geojson to SHPfile as zip
  zip <- toshpfile(text)
  
  # Save SHPFile as zip to temporary directory
  path <- paste(tempdir(), "\\shp.zip", sep="")
  writeBin(zip, path)
  
  # Convert SHPfile to geojson while transform the projection
  togeojson(path, projection)
}

# Function to calculate Kernel Density
kde <- function(file, boundary=0) {
  # Required library and arguments
  require(maptools)
  require(GISTools)
  
  # read shapefile into r as spatial data frame
  temp <- tempdir()
  zip <- unzip(file, list=T)
  fnameshp <- ""
  for(i in 1:nrow(zip)) {
    fname <- unzip(file, list=TRUE)$Name[i]
    unzip(file, files=fname, exdir=temp, overwrite=TRUE)
    if(grepl(".shp", fname)) {
      fnameshp <- unzip(file, list=TRUE)$Name[i]
    }
  }
  fpath = file.path(temp, fnameshp)
  ncc_accidentshp <- readShapeSpatial(fpath)
  unlink(temp)
  
  # read boundary shapefile into r as spatial data frame
  if(boundary != 0)
  {
    temp <- tempdir()
    zip <- unzip(boundary, list=T)
    fnameshp <- ""
    for(i in 1:nrow(zip)) {
      fname <- unzip(boundary, list=TRUE)$Name[i]
      unzip(boundary, files=fname, exdir=temp, overwrite=TRUE)
      if(grepl(".shp", fname)) {
        fnameshp <- unzip(boundary, list=TRUE)$Name[i]
      }
    }
    fpath = file.path(temp, fnameshp)
    ncc_sp <- readShapeSpatial(fpath)
    unlink(temp)
    
    nccAcc.den <- kde.points(ncc_accidentshp,lims=ncc_sp)
    
    level.plot(nccAcc.den)
    
    masker2 <- poly.outer(nccAcc.den,ncc_sp,extend=1000); add.masking(masker2)
    
    plot(ncc_sp,add=TRUE, main="Kernel Density Estimation")
  }
  else
  {
    # Convert from spatial data frame to generic 
    ncc_accident <- as(ncc_accidentshp, "SpatialPoints")
    
    # Convert the generic sp format into spatstat's pp format
    ncc_accidentpp <- as(ncc_accident, "ppp")
    
    # Compute KDE
    kde_ncc_1000 <- density(ncc_accidentpp,1000)
    
    plot(kde_ncc_1000, main="Kernel Density Estimation");
  }
}

# Function to calculate L-function
lfunction <- function(file) {
  # load maptools library
  require(maptools)
  
  # read shapefile into r as spatial data frame
  temp <- tempdir()
  zip <- unzip(file, list=T)
  fnameshp <- ""
  for(i in 1:nrow(zip)) {
    fname <- unzip(file, list=TRUE)$Name[i]
    unzip(file, files=fname, exdir=temp, overwrite=TRUE)
    if(grepl(".shp", fname)) {
      fnameshp <- unzip(file, list=TRUE)$Name[i]
    }
  }
  fpath = file.path(temp, fnameshp)
  ncc_accidentshp <- readShapeSpatial(fpath)
  unlink(temp)
  
  # convert from spatial data frame to generic 
  ncc_accident <- as(ncc_accidentshp, "SpatialPoints")
  
  ncc_accidentpp <- as(ncc_accident, "ppp")
  
  L <- Lest(ncc_accidentpp)
  
  plot(L, main="L-Function Envelope")
}


# Function to calculate NNI
nni <- function(file, boundary) {
  # load maptools library
  require(maptools)
  require(spatstat)
  
  # read shapefile into r as spatial data frame
  temp <- tempdir()
  zip <- unzip(file, list=T)
  fnameshp <- ""
  for(i in 1:nrow(zip)) {
    fname <- unzip(file, list=TRUE)$Name[i]
    unzip(file, files=fname, exdir=temp, overwrite=TRUE)
    if(grepl(".shp", fname)) {
      fnameshp <- unzip(file, list=TRUE)$Name[i]
    }
  }
  fpath = file.path(temp, fnameshp)
  ncc_accidentshp <- readShapeSpatial(fpath)
  unlink(temp)
  
  # read boundary shapefile into r as spatial data frame
  temp <- tempdir()
  zip <- unzip(boundary, list=T)
  fnameshp <- ""
  for(i in 1:nrow(zip)) {
    fname <- unzip(boundary, list=TRUE)$Name[i]
    unzip(boundary, files=fname, exdir=temp, overwrite=TRUE)
    if(grepl(".shp", fname)) {
      fnameshp <- unzip(boundary, list=TRUE)$Name[i]
    }
  }
  fpath = file.path(temp, fnameshp)
  ncc_sp <- readShapeSpatial(fpath)
  unlink(temp)
  
  #set window to polygon
  nccwin <- as.owin(ncc_sp)
  
  # convert from spatial data frame to generic 
  ncc_accident <- as(ncc_accidentshp, "SpatialPoints")
  
  #Convert the generic sp format into spatstat's pp format
  ncc_accidentpp <- as(ncc_accident, "ppp")
  x <- unmark(ncc_accidentpp)
  x<-x[nccwin]
  
  #compute the NN
  nnd <- nndist(ncc_accidentpp)
  hist(nnd)
  
  #Compute NNI
  nni <- nnfun(ncc_accidentpp)
  x <- nnfun(x)
  
  #Compute G test statistics
  G <- Gest(ncc_accidentpp)
  plot(G, main="NNI G Test Statistic")
}


