from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse
from subprocess import run, TimeoutExpired
from json import dumps as json_dumps
import sys

host_name = "127.0.0.1"
server_port = 8080
ps_execution_timeout = 10  # Timeout for push_swap execution (in seconds)
ps_path = ""

# Ref: Basic python HTTP server
# https://pythonbasics.org/webserver/
class PushSwapServer(BaseHTTPRequestHandler):
  def do_GET(self):
    ps_args = parse_url_to_args(self.path)
    try:
      (stdout, stderr) = execute_pushswap(ps_args)
    except TimeoutExpired:
      # TODO: Handle this and return some sensible error
      pass
    self.send_response(200)
    # TODO: CORS may be too broad. Consider narrowing it down
    self.send_header("Access-Control-Allow-Origin","*")
    self.send_header("Access-Control-Allow-Methods","*")
    self.send_header("Access-Control-Allow-Headers","*")
    self.send_header("Content-type", "text/plain")
    self.end_headers()
    data = json_dumps({
        "stdout": stdout,
        "stderr": stderr,
    })
    self.wfile.write(bytes(data, "utf-8"))
    print(ps_args)
    print(data)

def start_webserver():
  web_server = HTTPServer((host_name, server_port), PushSwapServer)
  print("Python linker running (test)")

  try:
    web_server.serve_forever()
  except KeyboardInterrupt:
    pass

  web_server.server_close()
  print("Server stopped.")

def parse_url_to_args(input_string):
  # Ref: URl parsing using standard library
  # https://docs.python.org/3/library/urllib.parse.html
  parsed_url = urlparse(input_string)
  query_string = parsed_url.query
  output = query_string.split(",")
  return output

def execute_pushswap(input_args):
  if str(ps_path.parent) == ".":
    args = [str(ps_path.parent) + "/" + str(ps_path.name)]
  else:
    args = [str(ps_path.parent) + "./" + str(ps_path.name)]
  args.extend(input_args)
  returned_values = run(args, capture_output = True, timeout = ps_execution_timeout, encoding = "utf-8")  
  # returned_values = run(["ls"], capture_output = True, timeout = 10, encoding = "utf-8")
  stdout = returned_values.stdout
  stderr = returned_values.stderr
  return (stdout, stderr)

def parse_argv_to_path(argv):
  argc = len(argv)
  if argc != 2:
    print("Usage: python3 linker.py [path-to-pushswap-file]")
    print("Incorrect number of arguments given")
    return None
  file_name_string = argv[1]
  if file_name_string[0] == "/":
    full_path = Path(file_name_string)
  else:
    current_working_directory = Path(".")
    full_path = current_working_directory / file_name_string
  if full_path.exists() == False:
    print("Usage: python3 linker.py [path-to-pushswap-file]")
    print("File at that path not found. Path can be absolute (prefix with /) or relative")
    return None
  if full_path.is_dir() == True:
    print("Usage: python3 linker.py [path-to-pushswap-file]")
    print("Path given was a directory. Please give path to file itself (including filename)")
    return None
  return full_path


if __name__ == "__main__":
  ps_path = parse_argv_to_path(sys.argv)
  if not ps_path:
    print("Exiting")
  else:
    print(f"Directory: {ps_path.parent}")
    print(f"File name: {ps_path.name}")
    print("Ctrl + c to stop")
    start_webserver()