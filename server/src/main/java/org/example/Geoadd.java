package org.example;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class Geoadd extends HttpServlet {
    public void doGet(HttpServletRequest req, HttpServletResponse res)  throws ServletException, IOException{
        res.setContentType("text/html");
        PrintWriter out = res.getWriter();
        out.println("FULL JSON");
    }
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String longCoo = req.getParameter("long");
        String latCoo = req.getParameter("lat");
        res.setContentType("text/plain");
        PrintWriter out = res.getWriter();
        try {
            Class.forName("org.postgresql.Driver");
            Connection connection = DriverManager.getConnection("jdbc:postgresql://postgis:5432/postgres?user=postgres&password=password");
            PreparedStatement preparedStatement;
            preparedStatement = connection.prepareStatement("DELETE FROM PUBLIC.ressource WHERE  st_intersects(coo,st_geomfromtext('POINT(" +
                    longCoo + // Longitude -0.457482
                    " " +
                    latCoo + // Latitude 46.321705
                    ")', 4326))");
            int nbr = preparedStatement.executeUpdate();
            out.println(nbr);
            connection.close();
        } catch (SQLException | ClassNotFoundException e) {
            out.println("<big> Error accessing database </big>");
            out.println("<code>" +e+ "</code>");
        }
    }
}
