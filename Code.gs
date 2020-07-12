/**
* Returns a string of the full file path of a file or folder based on its ID.
* Note: If the file or folder is located in more than one folder within Google
Drive then getFilePathById returns an array of all file paths for that file or
folder.
*
* @function getFilePathById
* @author Shir Aviv <https://excelshir.com>
* @version 1.0
* Date created: July 11, 2020
*
* @param {string} fileOrFolderId - ID of the desired file or folder.
* @param {string} [delimiter=" > "] - The characters in between each folder in the
path.
*  - Note: If omitted, the default is " > ".
* @param {number} [pathCountMax=10] - The maximum number of paths that will be
displayed. If the result count exceeds pathCountMax then an error message
will be displayed.
*  - Note: If omitted, the default value is 10.
*
* @returns {(string|Array)} path - String of the file path of fileOrFolderId, or
an array of all file paths of fileOrFolderId.
*  - If there is NO error, "path" returns the full file path of fileOrFolderId.
*  - If there IS an error, "path" returns an error message for user to display or
     log.
*/

function getFilePathById(fileOrFolderId, delimiter = " > ", pathCountMax = 10) {
  var path = [];
  var pathHelper = [];
  var pathFolderCount = 0;
  var folderNameArray = [];
  var parentFolder = "";
  var parentFolders = "";
  var parentFolderCount = 0;
  var parentFolderIdArray = [];
  var parentFolderNameArray = [];
  
  // --- Start of error checking ---
  // Error checking for @param fileOrFolderId
  
  // Use try and catch when using fileOrFolderId to avoid an error.
  try {
    // Capture invalid entry errors
    if (fileOrFolderId == "") throw "empty";
    if (fileOrFolderId == null) throw "null";
    if (typeof fileOrFolderId == "number") throw "a number"; 
    if (typeof fileOrFolderId == "object") throw "an object";
    if (typeof fileOrFolderId != "string") throw "not a string";
    
    // Assign all parent folders of a file by fileId.
    parentFolders = DriveApp.getFileById(fileOrFolderId).getParents();
  }
  
  // If there is an Exception, specify the error message in path variable.
  catch(err){
    
    // The only way to check if the fileOrFolderId is invalid is to try it and
    // get an Exception.
    if (err.name == "Exception"){
      err = "invalid";
    }
    
    // Specify error message.
    path = "fileOrFolderId is " + err +
           ". Please enter a valid fileId and try again.";
    
    // Return path variable and end the script if there is an error.
    return path;
  }
  
  // Error checking for @param delimiter
  
  // Use try and catch when using delimiter to avoid an error.
  try {
    // Capture invalid entry errors
    if (typeof delimiter == "object") throw "an object";
  }
  
  // If there is an Exception, specify the error message in path variable.
  catch(err){
    
    // Specify error message.
    path = "delimiter is " + err +
           ". Please enter a valid delimiter and try again.";
    
    // return path variable and end the script if there is an error.
    return path;
  }
  
  // Error checking for @param pathCountMax
  
  // Use try and catch when using pathCountMax to avoid an error.
  try {
    // Capture invalid entry errors
    if (pathCountMax == null) throw "null";
    if (typeof pathCountMax == "object") throw "an object";
    if (typeof pathCountMax == "boolean") throw "a boolean";
    if (typeof pathCountMax == "string") throw "a string";
    if (typeof pathCountMax != "number") throw "not a number";
  }
  
  // If there is an Exception, specify the error message in the result.
  catch (err){
    
    // Specify error message.
    result = "pathCountMax is " + err + ". Please enter a valid " +
             "pathCountMax (or omit it) and try again.";
    
    //Return result variable and end the script if there is an error.
    return result;
  }

  // --- End of error checking ---

  // Loop through all parent folders of fileId to determine parentFolderCount,
  // assign Ids to parentFolderIdArray, and assign names to parentFolderNameArray.
  while (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
    parentFolderIdArray[parentFolderCount] = parentFolder.getId();
    parentFolderNameArray[parentFolderCount] = parentFolder.getName();
    parentFolderCount++;
  }
  
  // Reset parentFolders
  parentFolders = DriveApp.getFileById(fileOrFolderId).getParents();
  
  // If 0 == parentFolderCount, then show error message.
  // Note: This scenario cannot actually occur since even a file with no direct
  // parent folder is still considered to be part of "My Drive" as the parent
  // folder.
  if (0 == parentFolderCount) {
    path = "There are 0 parent folders for fileOrFolderId. " + 
           "Please enter a different fileOrFolderId and try again."
  }
  
  // If there are more parent Folders than the pathCountMax, then show error message.
  else if (pathCountMax < parentFolderCount) {
    path = "There are " + parentFolderCount + " parent folders in your drive for " +
           "fileOrFolderId. Please increase the @param pathCountMax (current " +
           "value of " + pathCountMax + ")\n" +
           "to match or exceed the parentFolderCount and try again.";
  }
  
  // Else if 1 == parentFolderCount, then proceed with the simplest scenario.
  else if (1 == parentFolderCount) {
    
    // Loop through all parent folders while there is still a next one and
    // add the name of each parentFolder to folderNameArray.
    while (parentFolders.hasNext()) {
      
      // Assign parentFolder to the next iteration of parentFolders.
      parentFolder = parentFolders.next();
      
      // Assign the current parentFolder name to folderNameArray.
      folderNameArray.push(parentFolder.getName());
      
      // Get the parent folder of the parent folder
      // (i.e. go one level back up the file path).
      parentFolders = parentFolder.getParents();
    }
    
    // Reverse the order of the folder names for easier viewing.
    folderNameArray = folderNameArray.reverse();
    
    // Assign the number of folders in the path to pathFolderCount.
    // Note: this is the number of "levels" deep the file path is, in the hierarchy
    // of the path.
    // Example: My Drive > Main Folder > Sub Folder
    // pathFolderCount would be 3.
    pathFolderCount = folderNameArray.length;
    
    // Loop through the folder names of the file path and assign forlderNameArray
    // to path.
    for (i = 0; i < pathFolderCount; i++){
      path = path + folderNameArray[i];
      
      // This if statement ensures there is no delimiter at the end of the path by
      // only adding the delimiter if this is not the last time in the loop.
      if (pathFolderCount - 1 != i) {
        path = path + delimiter;
      }
    }
  }
  
  // Else if 1 < parentFolderCount, then create a file path for each instance of
  // the same file that happens to be in multiple parent folders, and assign to
  // pathArray.
  // Note: there is only 1 unique file since we are using fileId, and not fileName.
  else if (1 < parentFolderCount) {
    
    // Loop through all instances of parent folders by folderId.
    for (j = 0; j < parentFolderCount; j++) {  
      
      // Reset variables
      parentFolders = DriveApp.getFileById(fileOrFolderId).getParents();
      folderNameArray = [];
      pathFolderCount = 0;
      pathHelper = "";
      
      // Assign the current parent Folder to the correct instance of the original
      // level 1 parent folders, using parentFolderIdArray.
      parentFolders = DriveApp.getFolderById(parentFolderIdArray[j]).getParents();
      
      // Loop through all parent folders while there is still a next one and
      // add the name of each parentFolder to folderNameArray.
      // NOTE: this loop is different in the sense that it is starting out with
      // the parents of the first level parent of fileId. In essence, this "skips"
      // one parent level which then has to be added back at the end.
      while (parentFolders.hasNext()) {
        
        // Assign parentFolder to the next iteration of parentFolders.
        parentFolder = parentFolders.next();
        
        // Assign the current parentFolder name to folderNameArray.
        folderNameArray.push(parentFolder.getName());
        
        // Get the parent folder of the parent folder
        // (i.e. go one level back up the file path).
        parentFolders = parentFolder.getParents();
      }
      
      // Reverse the order of the folder names for easier viewing.
      folderNameArray = folderNameArray.reverse();
      
      // Add back in the original level 1 parent that got skipped.
      folderNameArray.push(parentFolderNameArray[j]);
      
      // Assign the number of folders in the path to pathFolderCount.
      // Note: this is the number of "levels" deep the file path is, in the
      // hierarchy of the path.
      // Example: My Drive > Main Folder > Sub Folder
      // This is 3, since there are 3 folders in this path.
      pathFolderCount = folderNameArray.length;
      
      // Loop through the folder names of the file path and assign
      // forlderNameArray to path.
      for (i = 0; i < pathFolderCount; i++){
        pathHelper = pathHelper + folderNameArray[i];
        
        // This if statement ensures there is no delimiter at the end of the path.
        // Only add the delimiter if this is not the last time in the loop.
        if (pathFolderCount - 1 != i) {
          pathHelper = pathHelper + delimiter;
        }
      }
      path[j] = pathHelper;
    }
  }
  return path;
}


/**
* Returns a string of the Id of a file based on the file's name.
* Note: If there is more than 1 file with the same name then getFileIdByName
returns an array of all file paths for that file with the file Id at the end.
*
* @function getFileIdByName
* @author Shir Aviv <https://excelshir.com>
* @version 1.0
* Date created: July 11, 2020
*
* @param {string} fileName - Name of the desired file.
* @param {number} [fileCountMax=10] - The maximum number of files that will be
displayed. If the file count exceeds fileCountMax then an error message
will be displayed.
*  - Note: If omitted, the default value is 10.
*
* @returns {(string|Array)} result - String of the file Id of fileName, or an array
of all file paths of files with the name fileName.
*  - If there is NO error, "result" returns the Id of fileName.
*  - If there IS an error, "result" returns an error message for user to display
     or log.
*/

function getFileIdByName(fileName, fileCountMax = 10) {

  // Declare variables.
  var fileCount = 0;
  var fileIdArray = [];
  var result = [];
  var files = "";
  var file = "";
  
  // --- Start of error checking ---
  // Error checking for @param fileName
  
  // Use try and catch when using fileName to avoid an error.
  try {
    // Capture invalid entry errors
    if (fileName == "") throw "empty";
    if (fileName == null) throw "null";
    if (typeof fileName == "object") throw "an object";
    if (typeof fileName == "boolean") throw "a boolean";
    
    // Assign all files with the name fileName to files.
    files = DriveApp.getFilesByName(fileName);
  }
  
  // If there is an Exception, specify the error message in the result.
  catch (err){

    // Specify error message.
    result = "fileName is " + err + ". Please enter a valid fileName and try again.";
    
    //Return result variable and end the script if there is an error.
    return result;
  }
  
  // Error checking for @param fileCountMax
  
  // Use try and catch when using resultCountMax to avoid an error.
  try {
    // Capture invalid entry errors
    if (fileCountMax == null) throw "null";
    if (typeof fileCountMax == "object") throw "an object";
    if (typeof fileCountMax == "boolean") throw "a boolean";
    if (typeof fileCountMax == "string") throw "a string";
    if (typeof fileCountMax != "number") throw "not a number";
  }
  
  // If there is an Exception, specify the error message in the result.
  catch (err){
    
    // Specify error message.
    result = "fileCountMax is " + err + ". Please enter a valid " +
             "fileCountMax (or omit it) and try again.";
    
    //Return result variable and end the script if there is an error.
    return result;
  }
  
  // --- End of error checking ---
  
  // Loop through all files with name fileName to determine fileCount and assign Ids
  // to fileIdArray.
  while (files.hasNext()) {
    file = files.next();
    fileIdArray.push(file.getId());
    fileCount++;
  };
  
  // If there are 0 files with the name fileName, then show error message.
  if (0 == fileCount) {
    result = "No file in your drive exists with the name: " + fileName;  
  }

  // If there are more folders than the resultCountMax, then show error message.
  else if (fileCountMax < fileCount) {
    result = "There are " + fileCount + " files in your drive with the name: " +
             fileName + ".\n" + "Please increase the @param fileCountMax "
             "(current value of " + fileCountMax + ")\n" +
             "to match or exceed the fileCount and try again.";
  }

  // If there is EXACTLY 1 file with the name fileName, then assign the file Id.
  else if (1 == fileCount) {
    result = fileIdArray[0];
  }
  
  // If there are multiple files with the name fileName, then display the full file
  // path for each instance of the file with the name fileName and assign to
  // resultArray.
  // Note: If one of these files is in multiple folders, then each instance of that
  // file path will be concatenated together, with a single file Id at the end. This
  // represents one unique file with multiple locations, hence multiple file paths.
  else if (1 < fileCount) {
    
    // Loop through all instances of the file with the name fileName and assign each
    // file Id to filePathArray.
    for (k = 0; k < fileCount; k++) {
      
      // Assign the file path + file Id to resultArray.
      result[k] = getFilePathById(fileIdArray[k]," > ") + " > " + fileIdArray[k];
    }
  }
  return result;
}


/**
* Returns a string of the Id of a folder based on the folder's name.
* Note: If there is more than 1 folder with the same name then getFolderIdByName
returns an array of all folder paths for that folder with the folder Id at the end.
*
* @function getFolderIdByName
* @author Shir Aviv <https://excelshir.com>
* @version 1.0
* Date created: July 11, 2020
*
* @param {string} folderName - Name of the desired folder.
* @param {number} [folderCountMax=10] - The maximum number of folders that will be
displayed. If the folder count exceeds resultCountMax then an error message
will be displayed.
*  - Note: If omitted, the default value is 10.
*
* @returns {(string|Array)} result - String of the folder Id of folderName, or an array
of all folder paths of folders with the name folderName.
*  - If there is NO error, "result" returns the Id of folderName.
*  - If there IS an error, "result" returns an error message for user to display
     or log.
*/

function getFolderIdByName(folderName, folderCountMax = 10) {

  // Declare variables.
  var folderCount = 0;
  var folderIdArray = [];
  var result = [];
  var folders = "";
  var folder = "";
  
  // --- Start of error checking ---
  // Error checking for @param folderName
  
  // Use try and catch when using folderName to avoid an error.
  try {
    // Capture invalid entry errors
    if (folderName == "") throw "empty";
    if (folderName == null) throw "null";
    if (typeof folderName == "object") throw "an object";
    if (typeof folderName == "boolean") throw "a boolean";
    
    // Assign all files with the name fileName to files.
    folders = DriveApp.getFoldersByName(folderName);
  }
  
  // If there is an Exception, specify the error message in the result.
  catch (err){

    // Specify error message.
    result = "folderName is " + err + ". Please enter a valid folderName and try again.";
    
    //Return result variable and end the script if there is an error.
    return result;
  }
  
  // Error checking for @param folderCountMax
  
  // Use try and catch when using folderCountMax to avoid an error.
  try {
    // Capture invalid entry errors
    if (folderCountMax == null) throw "null";
    if (typeof folderCountMax == "object") throw "an object";
    if (typeof folderCountMax == "boolean") throw "a boolean";
    if (typeof folderCountMax == "string") throw "a string";
    if (typeof folderCountMax != "number") throw "not a number";
  }
  
  // If there is an Exception, specify the error message in the result.
  catch (err){
    
    // Specify error message.
    result = "folderCountMax is " + err + ". Please enter a valid " +
             "folderCountMax (or omit it) and try again.";
    
    //Return result variable and end the script if there is an error.
    return result;
  }
  
  // --- End of error checking ---
  
  // Loop through all folders with name folderName to determine folderCount and assign Ids
  // to folderIdArray.
  while (folders.hasNext()) {
    folder = folders.next();
    folderIdArray.push(folder.getId());
    folderCount++;
  };
  
  // If there are 0 folders with the name folderName, then show error message.
  if (0 == folderCount) {
    result = "No file in your drive exists with the name: " + folderName;  
  }
  
  // If there are more folders than the resultCountMax, then show error message.
  else if (folderCountMax < folderCount) {
    result = "There are " + folderCount + " folders in your drive with the name: " +
             folderName + ".\n" + "Please increase the @param folderCountMax "
             "(current value of " + folderCountMax + ")\n" +
             "to match or exceed the folderCount and try again.";
  }

  // If there is EXACTLY 1 folder with the name folderName, then assign the folder Id.
  else if (1 == folderCount) {
    result = folderIdArray[0];
  }
  
  // If there are multiple folders with the name folderName, then display the full folder
  // path for each instance of the folder with the name folderName and assign to
  // resultArray.
  // Note: If one of these folders is in multiple folders, then each instance of that
  // file path will be concatenated together, with a single folder Id at the end. This
  // represents one unique folder with multiple locations, hence multiple file paths.
  else if (1 < folderCount) {
    
    // Loop through all instances of the folder with the name folderName and assign each
    // folder Id to folderPathArray.
    for (l = 0; l < folderCount; l++) {
      
      // Assign the file path + folder Id to resultArray.
      result[l] = getFilePathById(folderIdArray[l]," > ") + " > " + folderIdArray[l];
    }  
  }
  return result;
}
