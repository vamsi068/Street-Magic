<?php
// Clear the "user" cookie
setcookie("user", "", time() - 3600);

// Redirect to the home page
header("Location: ../index.");
exit;
?>