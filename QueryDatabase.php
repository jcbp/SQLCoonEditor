<?php

include 'classes/DBConnection.php';
include 'classes/WebResponder.php';
include 'classes/AppArgs.php';

class QueryDatabase {

	private $responder;
	private $arguments;

	function __construct() {
		$this->arguments = new AppArgs(AppArgs::GET);
		$this->responder = $this->getResponder();
	}

	private function getResponder() {
		if ($this->arguments->isVarExist("jsonp")) {
			$responder = new JSONPResponder();
			$responder->wrapperBegin = "\"";
			$responder->wrapperEnd = "\"";
			$responder->setFunctionName($this->arguments->getVar("jsonp"));
		}
		else {
			$responder = new JSONResponder();
		}
		return $responder;
	}

	public function performQuery() {
		$response = array();
		$query = $this->arguments->getVar("sql");
		try {
			$dbconn = new DBConnection("xml/appconfig.xml", $this->responder);
			$result = $dbconn->query($query);
			$response["resultSet"] = $dbconn->resultsetToArray($result);
			$response["affectedRows"] = $dbconn->getAffectedRows();
			$dbconn->close();
		}
		catch (Exception $e) {
			$this->responder->respond($e->getMessage());
		}
		$this->responder->respond(json_encode($response));
	}
}

$queryDB = new QueryDatabase();
$queryDB->performQuery();

?>
